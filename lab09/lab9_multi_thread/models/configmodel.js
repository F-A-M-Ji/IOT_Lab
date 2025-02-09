const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConfigSchema = new Schema({
  waterTimer: String,
  time:String,
});

const ConfigModel = mongoose.model('config', ConfigSchema);

module.exports = ConfigModel;