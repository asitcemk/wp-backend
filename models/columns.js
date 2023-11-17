const { Schema, model } = require("mongoose");

const ColumnsSchema = new Schema({
    list_name: { type: String, required: true },
    json_columns: { type: String, required: true },
    status:{ type: Boolean, default: true},
    is_deleted:{ type: Boolean, default: false},
    createdAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null }
});

ColumnsSchema.pre('save', function(next){
    now = new Date();
    this.updatedAt = now;
    if ( !this.createdAt ) {
      this.createdAt = now;
    }
    next();
  });

module.exports = model("Columns", ColumnsSchema);
