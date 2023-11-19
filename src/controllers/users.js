const User = require("../models/users")

// Renders New User form
module.exports.newUserForm = async (req, res) => {
    res.render('users/register'); 
  };
  
  // Registers a new user
  module.exports.createUser = async (req, res) => {
    try {
      const { username, password, email } = req.body;
      const user = new User({ username, email });
      const registedUser = await User.register(user, password);
      req.login(registedUser, (err) => {
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
  module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash("success", "Goodbye!");
    res.redirect(process.env.DOMAIN);
  };