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
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.loginUser
  );

// Logout user
router.get("/logout", users.logoutUser);

module.exports = router;