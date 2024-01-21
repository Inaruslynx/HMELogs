require("dotenv").config();
const ejs = require("ejs");
const path = require("path");
const User = require("../models/users");
const Log = require("../models/logs");
const { sendEmail } = require("../utils/sendEmail");

const ejsTemplate = path.join(__dirname, "../utils/noLogEmail.ejs");

const mongoose = require("mongoose");
const uri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@127.0.0.1:27017/?authMechanism=DEFAULT`;
const options = { dbName: "Logs" };
mongoose.connect(uri, options);

async function checkLog() {
  const timeEnd = new Date(Date.now());
  const timeStart = new Date(timeEnd);
  timeStart.setHours(timeEnd.getHours() - 23);
  //console.log("timeStart:", timeStart, "timeEnd:", timeEnd);
  const log = await Log.find({
    createdAt: {
      $gte: timeStart,
      $lt: timeEnd,
    },
  }).exec();
  if (log.length > 0) {
    return;
  }
  const admins = await User.find({ admin: true });
  //const admins = [{username: 'josh.edwards', email: 'josh.edwards@steeldynamics.com'}]
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
    //console.log(htmlPayload);
    //return { email: admin.email, username: admin.username };
    // send email to email with htmlPayload and title of email
    sendEmail(htmlPayload, admin.email, "No Log Data");
  }
  return;
}

checkLog();
