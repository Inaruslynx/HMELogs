const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Log = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true
        },
        data: {
            type: Schema.Types.Mixed,
            require: true
        }
    }, {
        timestamps: true
    }
)

module.exports = mongoose.model("Log", Log)