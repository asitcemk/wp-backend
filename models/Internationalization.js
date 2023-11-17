const { Schema, model } = require("mongoose");

const InternationalizationSchema = new Schema({
    english: {type: String, required: true, default: ''},
    bengali: {type: String, default: ''},
    hindi: {type: String,  default: ''},
    status:{ type: Boolean, default: true},
    is_deleted:{ type: Boolean, default: false},
    createdAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null }
});

InternationalizationSchema.pre('save', function(next){
  now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});


module.exports = model("Internationalization", InternationalizationSchema);
