const Log = require("../models/logs");
const { std, mean, min, max, round } = require("mathjs");

module.exports.getReport = async (req, res) => {
  const results = {};
  const resultsOfRecentLogs = {};
  const itemsOfConcern = {};

  // get all logs which will be an array of objects
  const logs = await Log.find().select("data -_id").exec();

  let refinedLogs = logs.map((log) => {
    //console.log(Object.entries(log.data));
    return log.data;
  });

  //refinedLogs will be just data with only numbers
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

  // We pop the last log off into it's own object
  const lastLog = refinedLogs.pop();

  // We get the long before the last yet don't remove it from refinedLogs
  const beforeLastLog = refinedLogs[refinedLogs.length - 1];

  // Iterate over each key in lastLog
  Object.keys(lastLog).forEach((key) => {
    // Check if the key exists in beforeLastLog
    if (beforeLastLog.hasOwnProperty(key)) {
      // Calculate the difference and store it in the resultsOfRecentLogs object
      resultsOfRecentLogs[key] = round(lastLog[key] - beforeLastLog[key], 2);
    }
  });
  // console.log(resultsOfRecentLogs);

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

    // Compare lastLog values against calculated statistics
    Object.keys(lastLog).forEach(key => {
      if (results.hasOwnProperty(key)) {
        const value = parseFloat(lastLog[key]);
        const { Min, Max, stdDev } = results[key];
        const recentLogDiff = resultsOfRecentLogs[key];

        const isAboveMax = value > Max;
        const isBelowMin = value < Min;
        const isAboveStdDev = Math.abs(recentLogDiff) > stdDev;
        
        if (isAboveMax || isBelowMin || isAboveStdDev) {
          itemsOfConcern[key] = {
            aboveMax: isAboveMax,
            belowMin: isBelowMin,
            aboveStdDev: isAboveStdDev
          };
        }
      }
    });
  console.log(itemsOfConcern)
  
  // console.log(lastLog);
  // This will render the page
  res.render("reports/page", { lastLog, beforeLastLog, results, resultsOfRecentLogs, itemsOfConcern });
};
