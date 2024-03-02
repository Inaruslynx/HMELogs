const Log = require("../models/logs");
const User = require("../models/users");
const isDst = require("../utils/isDst");

/*
Mongoose saves times using zulu time (GMT). 
The getHours() method of Date instances returns the hours for this date according to local time.
The setHours() method of Date instances changes the hours, minutes, seconds, and/or milliseconds for this date according to local time.
The getTime() method of Date instances returns the number of milliseconds for this date since the epoch, which is defined as the midnight at the beginning of January 1, 1970, UTC.
*/

module.exports.getWalkthrough = async (req, res) => {
  const currentUser = res.locals.currentUser;
  let date = req.query.date;
  const prev = req.query.prev === "true";
  const next = req.query.next === "true";
  let result = null;
  let returnDate = null;

  if (date) {
    // Create a startDate from user input
    const startDate = new Date(date);
    if (prev) {
      // User pressed previous with a date given
      // on the given day set hours to 8am
      // console.log("StartDate before setHours:", startDate)
      // UTC 14 is 8am CST
      startDate.setUTCHours(14, 0, 0, 0);
      //startDate.setHours(startDate.getHours() -24) // ! this is wrong
      // console.log("Searching for a log less than:", startDate)
      // query log
      result = await Log.findOne({
        date: { $lt: startDate },
      })
        .sort({ date: -1 })
        .exec();
      if (result) {
        const originalTime = result.date;
        // console.log("originalTime:", originalTime)
        // get 8am on day of log
        const eightAm = new Date(originalTime);
        eightAm.setUTCHours(14, 0, 0, 0);
        // console.log("originalTime:", originalTime, "eightAm:", eightAm)
        // if a log is before 8am set the date to the day before
        if (originalTime.getTime() < eightAm.getTime()) {
          returnDate = eightAm.setUTCHours(eightAm.getUTCHours() - 24);
          // console.log("returnDate:", returnDate)
        } else {
          returnDate = result.date;
        }
      }
    } else if (next) {
      // User pressed next with a date given
      // console.log("The date before anything:",startDate)
      startDate.setUTCHours(14, 0, 0, 0);
      // console.log("The date after 8:",startDate)
      // console.log("The getHours after 8:",startDate.getHours())
      startDate.setUTCHours(startDate.getUTCHours() + 24);
      // console.log("The date being searched for after 24:", startDate)
      // query log
      result = await Log.findOne({
        date: { $gte: startDate },
      }).exec();
      if (result) {
        const originalTime = result.date;
        // I need another time I can manipulate because setHours is messing with the original time
        // console.log("The time log was created:", originalTime)
        // console.log("startDate.getHours():", (startDate.getHours()))
        // Make a copy of log creation time
        const eightAm = new Date(originalTime);
        eightAm.setUTCHours(14, 0, 0, 0);
        // console.log("Now originalTime:", originalTime, "eightAm:", eightAm)
        // if the time on the log is less than 8am set it back a day
        if (originalTime.getTime() < eightAm.getTime()) {
          returnDate = eightAm.setUTCHours(eightAm.getUTCHours() - 24);
          // console.log("returnDate:", returnDate)
        } else {
          returnDate = result.date;
        }
      }
    } else {
      // user wants a specific date
      startDate.setUTCHours(14, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setUTCHours(endDate.getUTCHours() + 24);
      //find a log between start and end date
      result = await Log.findOne({
        date: { $gte: startDate, $lt: endDate },
      }).exec();
      returnDate = startDate;
    }
  } else if (prev) {
    // if the user pressed previous with no log pulled up
    const currentDate = new Date();
    //console.log("currentDate:",currentDate)
    result = await Log.findOne({ date: { $lt: currentDate } })
      .sort({ date: -1 })
      .exec();
    if (result) {
      const originalTime = result.date;
      // console.log("1st originalTime:", originalTime)
      const eightAm = new Date(originalTime);
      // console.log("eightAm:", eightAm)
      eightAm.setUTCHours(14, 0, 0, 0);
      // console.log("originalTime:", originalTime, "eightAm:", eightAm)
      // check if the log is before 8am
      if (originalTime.getTime() < eightAm.getTime()) {
        returnDate = eightAm.setUTCHours(eightAm.getUTCHours() - 24);
      } else {
        returnDate = result.date;
      }
      // console.log("returnDate:", returnDate)
    }
  }
  // The below code figures out what to send to the user
  if (result && currentUser) {
    const logUserData = await User.findById(result.user);
    // console.log(
    //   "currentUser:",
    //   currentUser.username,
    //   "logUser:",
    //   logUserData.username
    // );
    if (currentUser.username == logUserData.username) {
      // if logged in user == log user then they can edit
      // console.log("logid:", result._id);
      res.json({
        formEnabled: true,
        returnDate,
        results: result.data,
        logID: result._id,
      });
    } else {
      // else they just view logs
      res.json({ formEnabled: false, returnDate, results: result.data });
    }
  } else if (result) {
    // if no user logged in then just view
    res.json({ formEnabled: false, returnDate, results: result.data });
  } else {
    // if no results were generated then render a blank walkthrough making sure form is enabled
    // TODO Get data then show average and last. This will probably be too difficult without React.
    res.render("walkthrough/fill", { formEnabled: true }, function (err, html) {
      let package = `${html} 
      <script>window.localStorage.setItem("isFormDisabled", "false");</script>
      `;
      res.send(package);
    });
  }
};

module.exports.postWalkthrough = async (req, res, next) => {
  try {
    const data = req.body;
    if (!res.locals.currentUser) throw new Error("No current user.");
    const { _id } = res.locals.currentUser;
    const userData = await User.findById(_id);
    if (!userData) {
      throw new Error("Didn't find user by an id search");
    }

    // Check if logID was submitted and if so find existing log and update instead
    // Make sure to delete logID and pickedDate so it doesn't get saved in data
    if (data["logID"]) {
      if (data["pickedDate"] || data["pickedDate"] === "") delete data["pickedDate"];
      // console.log("there was a logID:", data["logID"]);
      const id = data["logID"];
      const options = { new: true };
      delete data["logID"];
      await Log.findByIdAndUpdate(id, { data }, options);
      // console.log(result)
    } else {
      // If pickedDate is blank, delete
      if (data["pickedDate"] === "") delete data["pickedDate"];
      // make sure there's no blank logID being sent
      delete data["logID"];
      // Check if there is a pickedDate
      // If true then submit log for given date
      if (data["pickedDate"]) {
        const date = new Date(data["pickedDate"]);
        delete data["pickedDate"];
        const cstOffsetInMinutes = isDst(date) ? -5 * 60 : -6 * 60;
        date.setUTCHours(8, 1, 0, 0);
        date.setUTCMinutes(date.getUTCMinutes() - cstOffsetInMinutes);
        const newLog = new Log({ user: userData._id, data, date });
        await newLog.save();
      } else {
        const newLog = new Log({ user: userData._id, data });
        await newLog.save();
      }
    }

    req.flash("success", "Log submitted successfully");
    res.send(
      `<script>
        window.localStorage.removeItem("formData");
        window.location.href = "${process.env.DOMAIN}/report";
      </script>`
    );
  } catch (e) {
    req.flash("error", e.message);
    res.json({ success: false, message: e.message });
  }
};

