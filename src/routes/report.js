const express = require("express");
const router = express.Router();
const reports = require("../controllers/report");
const { tryAsync } = require("../utils/tryAsync");

// handle requests for fill
router
  .route("/")
  .get(reports.getReport);

module.exports = router;