const Bree = require("bree");
const cabin = require("../index");

const bree = new Bree({
  jobs: [{ name: "checkLog", interval: "at 7:00am" }],
  errorHandler: (error, workerMetadata) => {
    if (workerMetadata.threadId) {
      cabin.info(
        `There was an error while running a worker ${workerMetadata.name} with thread ID: ${workerMetadata.threadId}`
      );
    } else {
      cabin.info(
        `There was an error while running a worker ${workerMetadata.name}`
      );
    }

    cabin.error(error);
  },
});

module.exports.startTimeJobs = async () => {
  await bree.start();
};
