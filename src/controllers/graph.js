const Log = require("../models/logs");

module.exports.getPage = async (req, res, next) => {
  const result = await Log.findOne({}, "data").sort({ createdAt: -1 });
  let data = [];

  const nowDate = new Date();
  console.log("This is nowDate before locale:", nowDate);
  let intermToDate = nowDate.toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
  });
  console.log("After:", intermToDate);
  intermToDate = intermToDate.split("/");
  intermToDate = [intermToDate[2], intermToDate[0], intermToDate[1]];
  // toDate will be YYYY-MM-DD
  const toDate = intermToDate.join("-");

  let intermFromDate = new Date(nowDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  console.log("This is intermFromDate before locale", intermFromDate);
  intermFromDate = intermFromDate.toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
  });
  console.log("After:", intermFromDate);
  intermFromDate = intermFromDate.split("/");
  intermFromDate = [intermFromDate[2], intermFromDate[0], intermFromDate[1]];
  // FromDate will be YYYY-MM-DD
  const fromDate = intermFromDate.join("-");

  // console.log(result.data)
  if (result.data && typeof result.data === "object") {
    for (const key in result.data) {
      if (!key.includes("Note")) {
        data.push(key);
      }
    }
    // console.log(data)
  }
  res.render("graphs/graph", { dataPoints: data, toDate, fromDate });
};

module.exports.processGraph = async (req, res, next) => {};
