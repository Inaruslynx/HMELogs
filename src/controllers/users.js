const { v4: uuid } = require("uuid");
const { sendEmail } = require("../utils/sendEmail");
const ejs = require("ejs");
const path = require("path");
const User = require("../models/users");
const PasswordReset = require("../models/PasswordReset");

// Renders New User form
module.exports.newUserForm = async (req, res) => {
  res.render("users/register");
};

// Registers a new user
module.exports.createUser = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const registeredUser = new User({ username: username, email: email });
    await registeredUser.setPassword(password);
    await registeredUser.save();
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Walkthroughs!");
      res.redirect(process.env.DOMAIN);
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

// Renders login page
module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

// Attempts to login user
module.exports.loginUser = (req, res) => {
  req.flash("success", "Welcome to Walkthroughs!");
  if (req.cookies.isLoggedIn) {
    res.cookie("isLoggedIn", "true", { httpOnly: true });
  }
  const redirectURL = req.session.returnTo || process.env.DOMAIN;
  res.redirect(redirectURL);
};

// Logout user
module.exports.logoutUser = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  if (req.cookies.isLoggedIn) {
    res.cookie("isLoggedIn", "false", { httpOnly: true });
  }
  req.flash("success", "Goodbye!");
  res.redirect(process.env.DOMAIN);
};

module.exports.renderForgotPassword = (req, res, next) => {
  res.render("users/forgotpassword");
};

module.exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    // no user/email found
    req.flash("error", "Email not found");
    res.redirect(process.env.DOMAIN + "forgotpassword");
  }
  const token = await PasswordReset.findOne({ user: user._id });
  if (token) await token.deleteOne();
  const resetToken = uuid();
  const newReset = new PasswordReset({
    user: user._id,
    token: resetToken,
  });
  const result =  await newReset.save();

  const link = `${process.env.DOMAIN}/passwordReset?token=${resetToken}&id=${user._id}`;
  let tempData = {
    userName: user.username,
    link: link,
  };
  const htmlPayload = await ejs.renderFile(
    path.join(__dirname, "../utils/passwordResetEmail.ejs"),
    tempData
  );
  if (await sendEmail(htmlPayload, user.email, "Password Reset Request")) {
    req.flash("success", "Email sent to reset password");
    res.redirect(process.env.DOMAIN);
  } else {
    req.flash("error", "Email couldn't be sent");
    res.redirect(process.env.DOMAIN + "forgotpassword");
  }
};

module.exports.renderPasswordReset = (req, res, next) => {
  const token = req.query.token;
  const id = req.query.id;
  res.render("users/passwordreset", { token: token, id: id });
};

module.exports.passwordReset = async (req, res, next) => {
  const { password, passwordConfirm, id, token } = req.body;
  const resetToken = await PasswordReset.findOne({ token });
  if (!resetToken) {
    req.flash("error", "Reset Password link expired");
    res.redirect("users/forgotpassword");
  }
  if (password === passwordConfirm) {
    const user = await User.findOne({ _id: id });
    if (user) {
      user.setPassword(password);
      user.save();
      const htmlPayload = await ejs.renderFile(
        path.join(__dirname, "../utils/passwordResetSuccess.ejs"),
        {
          userName: user.username,
        }
      );
      sendEmail(htmlPayload, user.email, "Password Reset Successful");
      await PasswordReset.deleteOne({token})
      req.flash("success", "Password successfully changed");
      res.redirect(process.env.DOMAIN + "login");
    }
  } else {
    req.flash("error", "Passwords don't match");
    res.redirect("back");
  }
};

module.exports.userDarkMode = async (req, res, next) => {
  try {
    const { darkMode } = req.body;
    if (!res.locals.currentUser) throw new Error("No current user.");
    const { _id } = res.locals.currentUser;
    const userData = await User.findById(_id);
    if (!userData) {
      throw new Error("Didn't find user by an id search");
    }
    if (darkMode === "dark") {
      userData.theme = "dark";
      await userData.save();
      res.json({ success: true, message: "Theme saved successfully" });
    } else if (darkMode === "light") {
      userData.theme = "light";
      await userData.save();
      res.json({ success: true, message: "Theme saved successfully" });
    } else {
      throw new Error(
        "While checking if the user selected light or dark mode there was an error"
      );
    }
  } catch (e) {
    res.json({
      success: false,
      message: `Theme was not saved successfully. ${e.message}`,
    });
    console.log("User theme was not saved.", e.message);
  }
};
