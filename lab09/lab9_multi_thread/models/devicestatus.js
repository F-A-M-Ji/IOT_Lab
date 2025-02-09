const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusSchema = new Schema({
  device: String,
  status: String,
  time:String,
});

const StatusModel = mongoose.model('deviceStatus', statusSchema);

module.exports = StatusModel;