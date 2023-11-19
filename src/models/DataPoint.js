const mongoose = require("mongoose")
const Schema = mongoose.Schema

const DataPoint = new Schema(
    {
        tag: {
            type: String,
            require: true
        },
        type: {
            type: String,
            require: true
        },
        area: {
            type: Schema.Types.ObjectId,
            ref: "Area",
            require: true
        }
    }
)