
const mongoose = require("mongoose");
const MONGODB_URI = "mongodb+srv://asitcemk:olRTOqMYpw3XNhCn@cluster0.k9ndbre.mongodb.net/cluster0?retryWrites=true&w=majority"

mongoose.connect(MONGODB_URI,{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true })
  .then(() => {
    console.log("Successfully connected to MongoDB.");
  }).catch(err => {
    console.log('Could not connect to MongoDB.');
    process.exit();
  });

