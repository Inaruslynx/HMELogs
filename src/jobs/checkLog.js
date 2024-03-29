require("dotenv").config();
const { parentPort } = require("worker_threads");
const ejs = require("ejs");
const path = require("path");
const User = require("../models/users");
const Log = require("../models/logs");
const { sendEmail } = require("../utils/sendEmail");

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
      console.log("Log found in last 24 hours. Exiting job.");
      if (parentPort) parentPort.postMessage("done");
      else process.exit(0);
    }

    console.log("No log found in the last 24 hours");
    const users = await User.find();
    // console.log(users)
    // const users = [
    //   { username: "josh.edwards", email: "josh.edwards@steeldynamics.com" },
    // ];
    const result = [];
    for (const user of users) {
      // I can just send an email as I go through the users.
      // Check if username is an email and split
      if (user.username.includes("@")) {
        user.username = user.username.split("@")[0];
      }
      // Construct htmlPayload for email
      const htmlPayload = await ejs.renderFile(ejsTemplate, {
        userName: user.username,
      });
      console.log("Sending an email to", user.username);
      // console.log(htmlPayload);
      //return { email: user.email, username: user.username };
      // send email to email with htmlPayload and title of email
      result.push(await sendEmail(htmlPayload, user.email, "No Log Data in Last 24 Hours"));
    }
    const hasFalse = result.some((element) => element === false);
    if (hasFalse) {
      console.log("An email wasn't sent successfully.");
      if (parentPort) parentPort.postMessage("fail");
      else process.exit(1);
    }
    console.log("Done sending emails. Exiting job.");
    if (parentPort) parentPort.postMessage("done");
    else process.exit(0);
  } catch (error) {
    console.log("Not able to successfully check daily log.");
    if (parentPort) parentPort.postMessage("fail");
    else process.exit(1);
  }
}

checkLog();
