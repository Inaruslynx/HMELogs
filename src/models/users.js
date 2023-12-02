const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")
const Schema = mongoose.Schema

const User = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        admin: {
            type: Schema.Types.Boolean,
            default: false
        },
        theme: {
            type: String,
            default: 'dark'
        }
    }
)

User.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", User)