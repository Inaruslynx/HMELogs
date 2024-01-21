const Bree = require('bree')

const bree = new Bree({ jobs: [{ name: 'checkLog', interval: 'at 7:00am' }] })

module.exports.startTimeJobs = async () => {
    await bree.start()
}