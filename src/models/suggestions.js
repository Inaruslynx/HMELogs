const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Suggestion = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true
        },
        suggestion: {
            type: String,
            require: true
        }
    }
)

module.exports = mongoose.model("Suggestion", Suggestion)