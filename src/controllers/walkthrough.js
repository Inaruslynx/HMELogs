const Log = require("../models/logs");
const User = require("../models/users");

module.exports.getWalkthrough = async (req, res) => {
  const currentUser = res.locals.currentUser;
  let date = req.query.date;
  const prev = req.query.prev === "true";
  const next = req.query.next === "true";
  let result = null;
  let returnDate = null;

  if (date) {
    const startDate = new Date(date);
    if (prev) {
      startDate.setHours(startDate.getHours() + 8 - 24);
      result = await Log.findOne({
        createdAt: { $lt: startDate },
      })
        .sort({ createdAt: -1 })
        .exec();
      if (result) {
        const originalTime = result.createdAt;
        const eightAm = new Date(originalTime.setHours(8, 0, 0, 0));
        if (originalTime.getTime() < eightAm.getTime()) {
          returnDate = eightAm.setTime(eightAm.getHours() - 24);
        } else {
          returnDate = result.createdAt;
        }
      }
    } else if (next) {
      startDate.setHours(startDate.getHours() + 8);
      startDate.setHours(startDate.getHours() + 24);
      result = await Log.findOne({
        createdAt: { $gte: startDate },
      }).exec();
      if (result) {
        const originalTime = result.createdAt;
        const eightAm = new Date(originalTime.setHours(8, 0, 0, 0));
        if (originalTime.getTime() < eightAm.getTime()) {
          returnDate = eightAm.setTime(eightAm.getHours() - 24);
        } else {
          returnDate = result.createdAt;
        }
      }
    } else {
      startDate.setHours(8, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 24);
      result = await Log.findOne({
        createdAt: { $gte: startDate, $lt: endDate },
      }).exec();
      returnDate = startDate;
    }
  } else if (prev) {
    const currentDate = new Date();
    result = await Log.findOne({ createdAt: { $lt: currentDate } })
      .sort({ createdAt: -1 })
      .exec();
    if (result) {
      const originalTime = result.createdAt;
      const eightAm = new Date(originalTime.setHours(8, 0, 0, 0));
      if (originalTime.getTime() < eightAm.getTime()) {
        returnDate = eightAm.setTime(eightAm.getHours() - 24);
      } else {
        returnDate = result.createdAt;
      }
    }
  }

  if (result && currentUser) {
    const logUserData = await User.findById(result.user);
    console.log(
      "currentUser:",
      currentUser,
      "result user:",
      logUserData,
      "result:",
      currentUser.username == logUserData.username
    );
    if (currentUser.username == logUserData.username) {
      res.json({ formEnabled: true, returnDate, results: result.data });
    } else {
      res.json({ formEnabled: false, returnDate, results: result.data });
    }
  } else if (result) {
    res.json({ formEnabled: false, returnDate, results: result.data });
  } else {
    res.render("walkthrough/fill", { formEnabled: true }, function (err, html) {
      let package = `${html} 
      <script>window.localStorage.setItem("isFormDisabled", "false");</script>
      `
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
    const newLog = new Log({ user: userData._id, data: data });
    await newLog.save();
    req.flash("success", "Log submitted successfully");
    res.send(
      `<script>window.localStorage.removeItem("formData"); window.location.href = "${process.env.DOMAIN}"</script>`
    );
  } catch (e) {
    req.flash("error", e.message);
    res.json({ success: false, message: e.message });
  }
};
