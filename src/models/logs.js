const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Log = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true
        },
        Data: {
            type: Schema.Types.Array,
            require: true
        }
    }, {
        timestamps: true
    }
)