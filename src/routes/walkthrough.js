const express = require("express");
const router = express.Router();
const walkthrough = require("../controllers/walkthrough");
const { tryAsync } = require("../utils/tryAsync");

// handle requests for fill
router
  .route("/")
  .get(walkthrough.getWalkthrough)
  .post(tryAsync(walkthrough.postWalkthrough));

module.exports = router;
