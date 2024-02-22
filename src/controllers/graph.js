const Log = require("../models/logs");

module.exports.getPage = async (req, res, next) => {
  const result = await Log.findOne({}, "data").sort({ createdAt: -1 });
  let data = [];

  const nowDate = new Date();
  // console.log("This is nowDate before locale:", nowDate);
  let intermToDate = nowDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Chicago",
  });
  // console.log("After:", intermToDate);
  intermToDate = intermToDate.split("/");
  intermToDate = [
    intermToDate[2],
    intermToDate[0].padStart(2, "0"),
    intermToDate[1].padStart(2, "0"),
  ];
  // toDate will be YYYY-MM-DD
  const toDate = intermToDate.join("-");

  let intermFromDate = new Date(nowDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  // console.log("This is intermFromDate before locale", intermFromDate);
  intermFromDate = intermFromDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Chicago",
  });
  // console.log("After:", intermFromDate);
  intermFromDate = intermFromDate.split("/");
  intermFromDate = [
    intermFromDate[2],
    intermFromDate[0].padStart(2, "0"),
    intermFromDate[1].padStart(2, "0"),
  ];
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

module.exports.processGraph = async (req, res, next) => {
  const { dataSelection, fromDate, toDate } = req.body;
  // console.log(dataSelection, fromDate, toDate);
  // Create new Date objects based on extracted values
  const fromDateObject = new Date(fromDate);
  const toDateObject = new Date(toDate);

  // Set UTC hours for the new objects
  fromDateObject.setUTCHours(14, 0, 0, 0);
  toDateObject.setUTCHours(14, 0, 0, 0);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  // console.log(dataSelection, fromDateObject, toDateObject);
  const result = await Log.find(
    { date: { $gte: fromDateObject, $lte: toDateObject } },
    ["data", "date"]
  ).exec();
  // console.log(result);
  const justSelectedData = result.map((item) => {
    const itemDate = item.date;
    const itemTimeUTC = itemDate.getUTCHours() * 60 + itemDate.getUTCMinutes(); // Convert time to minutes

    // Check if the time is before UTC 14:00
    if (itemTimeUTC < 14 * 60) {
      // If before UTC 14:00, set the time to 14:01 the day before
      const adjustedDate = new Date(itemDate);
      adjustedDate.setUTCDate(itemDate.getUTCDate() - 1);
      adjustedDate.setUTCHours(14, 1, 0, 0); // Set time to 14:01:00.000 UTC
      return {
        value:
          item.data[dataSelection] === "true"
            ? 1
            : item.data[dataSelection] === "false"
            ? 0
            : item.data[dataSelection],
        date: adjustedDate.toLocaleDateString("en-US", options),
      };
    } else {
      // If after or at UTC 14:00, keep the original date
      return {
        value:
          item.data[dataSelection] === "true"
            ? 1
            : item.data[dataSelection] === "false"
            ? 0
            : item.data[dataSelection],
        date: itemDate.toLocaleDateString("en-US", options),
      };
    }
  });

  // console.log(justSelectedData);
  res.json(justSelectedData);
};
