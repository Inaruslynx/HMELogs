const Log = require("../models/logs");
const User = require("../models/users");

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
        createdAt: { $lt: startDate },
      })
        .sort({ createdAt: -1 })
        .exec();
      if (result) {
        const originalTime = result.createdAt;
        // console.log("originalTime:", originalTime)
        // get 8am on day of log
        const eightAm = new Date(originalTime);
        eightAm.setUTCHours(14, 0, 0, 0);
        // console.log("originalTime:", originalTime, "eightAm:", eightAm)
        // if a log is before 8am set the date to the day before
        if (originalTime.getTime() < eightAm.getTime()) {
          returnDate = eightAm.setHours(eightAm.getHours() - 24);
          // console.log("returnDate:", returnDate)
        } else {
          returnDate = result.createdAt;
        }
      }
    } else if (next) {
      // User pressed next with a date given
      // console.log("The date before anything:",startDate)
      startDate.setUTCHours(14, 0, 0, 0);
      // console.log("The date after 8:",startDate)
      // console.log("The getHours after 8:",startDate.getHours())
      startDate.setHours(startDate.getHours() + 24);
      // console.log("The date being searched for after 24:", startDate)
      // query log
      result = await Log.findOne({
        createdAt: { $gte: startDate },
      }).exec();
      if (result) {
        const originalTime = result.createdAt;
        // I need another time I can manipulate because setHours is messing with the original time
        // console.log("The time log was created:", originalTime)
        // console.log("startDate.getHours():", (startDate.getHours()))
        // Make a copy of log creation time
        const eightAm = new Date(originalTime);
        eightAm.setUTCHours(14, 0, 0, 0);
        // console.log("Now originalTime:", originalTime, "eightAm:", eightAm)
        // if the time on the log is less than 8am set it back a day
        if (originalTime.getTime() < eightAm.getTime()) {
          returnDate = eightAm.setHours(eightAm.getHours() - 24);
          // console.log("returnDate:", returnDate)
        } else {
          returnDate = result.createdAt;
        }
      }
    } else {
      // user wants a specific date
      startDate.setHours(8, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 24);
      //find a log between start and end date
      result = await Log.findOne({
        createdAt: { $gte: startDate, $lt: endDate },
      }).exec();
      returnDate = startDate;
    }
  } else if (prev) {
    // if the user pressed previous with no log pulled up
    const currentDate = new Date();
    //console.log("currentDate:",currentDate)
    result = await Log.findOne({ createdAt: { $lt: currentDate } })
      .sort({ createdAt: -1 })
      .exec();
    if (result) {
      const originalTime = result.createdAt;
      // console.log("1st originalTime:", originalTime)
      const eightAm = new Date(originalTime);
      // console.log("eightAm:", eightAm)
      eightAm.setHours(8, 0, 0,0)
      // console.log("originalTime:", originalTime, "eightAm:", eightAm)
      // check if the log is before 8am
      if (originalTime.getTime() < eightAm.getTime()) {
        returnDate = eightAm.setHours(eightAm.getHours() - 24);
      } else {
        returnDate = result.createdAt;
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
    // Make sure to delete logID so it doesn't get saved in data
    if (data["logID"]) {
      // console.log("there was a logID:", data["logID"]);
      const id = data["logID"]
      const options = { new: true };
      delete data["logID"];
      const result = await Log.findByIdAndUpdate(
        id,
        { data },
        options
      );
      // console.log(result)
    } else {
      // TODO this is where I need to handle a date
      delete data["logID"];
      const newLog = new Log({ user: userData._id, data: data });
      await newLog.save();
    }
    req.flash("success", "Log submitted successfully");
    res.send(
      `<script>window.localStorage.removeItem("formData"); window.location.href = "${process.env.DOMAIN}"</script>`
    );
  } catch (e) {
    req.flash("error", e.message);
    res.json({ success: false, message: e.message });
  }
};

// function findChangedValues(existingObject, updatedObject) {
//   const changedValues = {};

//   // Iterate through the keys of the existingObject
//   for (const key in existingObject) {
//     // Check if the key exists in the updatedObject and the values are different
//     if (key in updatedObject && existingObject[key] !== updatedObject[key]) {
//       changedValues[key] = updatedObject[key];
//     }
//   }
//   return changedValues;
// }
