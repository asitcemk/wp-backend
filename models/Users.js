const { Schema, model } = require("mongoose");

const UsersSchema = new Schema({
  user_type: { type: Number, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  gender: { type: String, required: true },
  mobile: { type: String, required: true },
  countrycode: { type: String, required: true },
  image: { type: String, default: "" },
  password: { type: String, required: true },
  otp: { type: String, default: "" },
  auth_token: { type: String, default: "" },
  reset_password_token: { type: String, default: "" },
  status: { type: Boolean, default: false },
  is_deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: null },
  updatedAt: { type: Date, default: null },
});

UsersSchema.pre("save", function (next) {
  now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

module.exports = model("Users", UsersSchema);
