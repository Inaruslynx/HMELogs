const mongoose = require("mongoose")
const DataPoint = require("./DataPoint")
const Schema = mongoose.Schema

const Area = new Schema(
    {
        name: {
            type: String,
            require: true,
        },
        areas: [
            {
                type: Schema.Types.ObjectId,
                ref: "Area"
            }
        ],
        DataPoint: [
            {
                type: Schema.Types.ObjectId,
                ref: "DataPoint"
            }
        ]
    }
)

module.exports = mongoose.model("Area", Area)