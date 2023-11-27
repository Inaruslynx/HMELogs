const User = require("../models/users")

// Renders New User form
module.exports.newUserForm = async (req, res) => {
    res.render('users/register'); 
  };
  
  // Registers a new user
module.exports.createUser = async (req, res, next) => {
    try {
      const { username, password, email } = req.body;
      console.log(`${username} ${password} ${email}`);
      //const user = new User({ username, email, password });
      console.log("Registering user")
      const registeredUser = new User({ username: username, email: email })
      await registeredUser.setPassword(password)
      await registeredUser.save()
      // const registedUser = await User.register({ username: username, email: email }, password, function (err, user) {
      //   if (err) {
      //     console.log(err)
      //   } 
      // });
      console.log(`Successfully registered: ${registeredUser}`)
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
    console.log(req.session.returnTo)
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