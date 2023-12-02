const User = require("../models/users")

// Renders New User form
module.exports.newUserForm = async (req, res) => {
    res.render('users/register'); 
  };
  
  // Registers a new user
module.exports.createUser = async (req, res, next) => {
    try {
      const { username, password, email } = req.body;
      const registeredUser = new User({ username: username, email: email })
      await registeredUser.setPassword(password)
      await registeredUser.save()
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
    const redirectURL = req.session.returnTo || process.env.DOMAIN;
    res.redirect(redirectURL);
  };
  
  // Logout user
  module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
      if (err) { return next(err) }
      res.redirect(process.env.DOMAIN)
    });
    req.flash("success", "Goodbye!");
    res.redirect(process.env.DOMAIN);
};
  
module.exports.renderForgotPassword = (req, res, next) => {
  res.render("users/forgotpassword")
}

module.exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body
  const result = await User.exists({ email: email })
  if (!result) {
      // no user/email found
      req.flash("error", "Email not found")
      res.redirect(process.env.DOMAIN + 'forgotpassword')
    } else {
      // email/user exists so send off an email to reset password
  }
  
}