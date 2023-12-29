const express = require("express");
const router = express.Router();
const passport = require("passport");

const { tryAsync } = require("../utils/tryAsync");
const users = require("../controllers/users");

// Handles all routes to /register
router
  .route("/register")
  // Renders New User form
  .get(users.newUserForm)
  // Registers a new user
  .post(tryAsync(users.createUser));

// Handles all routes to /login
router
  .route("/login")
  // Renders login page
  .get(users.renderLogin)
  // Attempts to login user
  .post(
    passport.authenticate("local", {
      failureFlash: "Problem with login. Check username and password.",
      failureRedirect: `${process.env.DOMAIN}login`,
    }),
    users.loginUser
  );

// Logout user
router.get("/logout", users.logoutUser);

// User forgot password
router
  .route("/forgotpassword")
  // renders the forgot password page
  .get(users.renderForgotPassword)
  .post(users.forgotPassword);

// Email link to reset password for user and should come with code in link.
router
  .route("/passwordReset")
  .get(users.renderPasswordReset)
  .post(users.passwordReset);

router.post("/darkmode", users.userDarkMode);

module.exports = router;
