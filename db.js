const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const Customer = new Schema({
  name: String,
  email: {type: String, unique: true},
  password: String
});

const Vendor = new Schema({
  name: String,
  email: {type: String, unique: true},
  password: String
});



