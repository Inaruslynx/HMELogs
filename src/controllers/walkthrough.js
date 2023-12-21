const Log = require("../models/logs");
const User = require("../models/users");

module.exports.getWalkthrough = (req, res) => {
  res.render("walkthrough/fill");
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
    res.send(`<script>window.localStorage.removeItem("formData"); window.location.href = "${process.env.DOMAIN}"</script>`)
  } catch (e) {
    req.flash("error", e.message);
    res.json({ success: false, message: e.message });
  }
};
