const Log = require("../models/logs");
const { std, mean, min, max, round } = require("mathjs");

module.exports.getReport = async (req, res) => {
  const results = {};
  const resultsOfRecentLogs = {};
  // get all logs which will be an array of objects
  const logs = await Log.find().select("data -_id").exec();
  let refinedLogs = logs.map((log) => {
    //console.log(Object.entries(log.data));
    return log.data;
  });
  refinedLogs = refinedLogs.map((data) => {
    //console.log(data)
    let result = Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) =>
          typeof parseFloat(value) === "number" && !isNaN(parseFloat(value))
      )
    );
    return result;
  });
  const lastLog = refinedLogs.pop();
  const beforeLastLog = refinedLogs[refinedLogs.length - 1];

  // Iterate over each key in lastLog
  Object.keys(lastLog).forEach((key) => {
    // Check if the key exists in beforeLastLog
    if (beforeLastLog.hasOwnProperty(key)) {
      // Calculate the difference and store it in the results object
      resultsOfRecentLogs[key] = round(lastLog[key] - beforeLastLog[key], 2);
    }
  });
  // console.log(resultsOfRecentLogs);

  // lastLog = Object.fromEntries(
  //   Object.entries(lastLog).filter(
  //     ([key, value]) =>
  //       typeof parseFloat(value) === "number" && !isNaN(parseFloat(value))
  //   )
  // );
  // console.log(refinedLogs);
  Object.keys(refinedLogs[0]).forEach((key) => {
    let values = refinedLogs.map((data) => parseFloat(data[key]));
    values = values.filter((value) => !isNaN(value));
    const Mean = round(mean(values), 2);
    const stdDev = round(std(values), 2);
    const Min = min(values);
    const Max = max(values);
    results[key] = {
      Mean,
      stdDev,
      Min,
      Max,
    };
  });
  // console.log(lastLog);
  // This will render the page
  res.render("reports/page", { lastLog, beforeLastLog, results, resultsOfRecentLogs });
};
