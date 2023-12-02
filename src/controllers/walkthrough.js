const logs = require("../models/logs");

module.exports.getWalkthrough = (req, res) => {
  res.render("walkthrough/fill");
};

module.exports.postWalkthrough = async (req, res, next) => {
    // TODO: Write code for submitting walkthrough
}