const { Schema, model } = require("mongoose");

const RolesSchema = new Schema({
    name: { type: String},
});

module.exports = model("Roles", RolesSchema);