require("dotenv").config();
const { parentPort } = require('worker_threads');
const ejs = require("ejs");
const path = require("path");
const User = require("../models/users");
const Log = require("../models/logs");
const { sendEmail } = require("../utils/sendEmail");

// const Axe = require("axe");
// const Cabin = require("cabin");
// const parseErr = require("parse-err");
// const safeStringify = require("fast-safe-stringify");
// const superagent = require("superagent");
// const { createId } = require("@paralleldrive/cuid2");
// const { Signale } = require("signale");
// const logger = new Axe({ logger: new Signale() });
// const PAPERTRAIL_TOKEN = process.env.PAPERTRAIL_TOKEN;

// // <https://github.com/cabinjs/axe/#send-logs-to-papertrail>
// async function hook(err, message, meta) {
//   //
//   // return early if we wish to ignore this
//   // (this prevents recursion; see end of this fn)
//   //
//   if (meta.ignore_hook) return;
//   if (!(err instanceof Error)) return;

//   try {
//     const request = superagent
//       .post("https://logs.collector.solarwinds.com/v1/log")
//       // if the meta object already contained a request ID then re-use it
//       // otherwise generate one that gets re-used in the API log request
//       // (which normalizes server/browser request id formatting)
//       .set(
//         "X-Request-Id",
//         meta && meta.request && meta.request.id ? meta.request.id : createId()
//       )
//       .set("X-Axe-Version", logger.config.version)
//       .timeout(5000);

//     request.auth("", PAPERTRAIL_TOKEN);

//     const response = await request
//       .type("application/json")
//       .retry(3)
//       .send(safeStringify({ err: parseErr(err), message, meta }));

//     logger.info("log sent over HTTP", { response, ignore_hook: true });
//   } catch (err) {
//     logger.fatal(err, { ignore_hook: true });
//   }
// }

// for (const level of logger.config.levels) {
//   logger.post(level, hook);
// }

// const cabin = new Cabin({ logger });

const ejsTemplate = path.join(__dirname, "../utils/noLogEmail.ejs");

const mongoose = require("mongoose");
// console.log(process.env.MONGO_USERNAME, process.env.MONGO_PASSWORD)
const uri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@127.0.0.1:27017/?authMechanism=DEFAULT`;
const options = { dbName: "Logs" };
mongoose.connect(uri, options);

async function checkLog() {
  // Get time now which should be 7am
  const timeEnd = new Date(Date.now());
  const timeStart = new Date(timeEnd);
  // Get 8am yesterday
  timeStart.setHours(timeEnd.getHours() - 23); //23
  //console.log("timeStart:", timeStart, "timeEnd:", timeEnd);
  try {
    const log = await Log.find({
      createdAt: {
        $gte: timeStart,
        $lt: timeEnd,
      },
    }).exec();
    if (log.length > 0) {
      cabin.info("Log found in last 24 hours. Exiting job.")
      if (parentPort) parentPort.postMessage('done');
  else process.exit(0);
    }
  
    cabin.info("No log found in the last 24 hours")
    //const admins = await User.find({ admin: true });
    // console.log(admins)
    const admins = [{username: 'josh.edwards', email: 'josh.edwards@steeldynamics.com'}]
    for (const admin of admins) {
      // I can just send an email as I go through the admins.
      // Check if username is an email and split
      if (admin.username.includes("@")) {
        admin.username = admin.username.split("@")[0];
      }
      // Construct htmlPayload for email
      const htmlPayload = await ejs.renderFile(ejsTemplate, {
        userName: admin.username,
      });
      cabin.info("Sending an email to", admin.username)
      // console.log(htmlPayload);
      //return { email: admin.email, username: admin.username };
      // send email to email with htmlPayload and title of email
      sendEmail(htmlPayload, admin.email, "No Log Data");
    }
    cabin.info("Done sending emails. Exiting job.")
    if (parentPort) parentPort.postMessage('done');
    else process.exit(0);
  } catch (error) {
    cabin.error(new Error("Not able to successfully check daily log."))
    process.exit(1)
  }
}

checkLog();
