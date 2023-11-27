const mongoose = require("mongoose")
const Schema = mongoose.Schema

const DataPoint = new Schema(
    {
        tag: {
            type: String,
            index: true,
            unique: true,
            require: true
        },
        name: {
            type: String,
            require: true
        },
        type: {
            type: String,
            enum: ['Text', 'Number', 'Boolean'],
            require: true
        },
        area: {
            type: Schema.Types.ObjectId,
            ref: "Area",
            require: true
        }
    }
)

module.exports = mongoose.model("DataPoint", DataPoint)