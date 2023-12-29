const mongoose = require("mongoose");
const User = require("./users");
const Schema = mongoose.Schema;

const PasswordReset = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: Schema.Types.String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

PasswordReset.index({ updateAt: 1 }, { expireAfterSeconds: 60 * 60 });

module.exports = mongoose.model("PasswordReset", PasswordReset);
