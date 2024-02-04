const express = require("express");
const router = express.Router();
const graph = require("../controllers/graph");
const { tryAsync } = require("../utils/tryAsync");

// handle requests for graph
router
  .route("/")
  .get(graph.getPage)
  .post(tryAsync(graph.processGraph));

module.exports = router;