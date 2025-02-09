const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const envSchema = new Schema({
  temperature: String,
  humidity: String,
  ec:String,
  ph:String,
  wp:String,
  fert:String,
  med:String,
  N:String,
  P:String,
  K:String,
  device:String,
  switchs:String,
  time:String,
});

const EnvModel = mongoose.model('current_envs', envSchema);

module.exports = EnvModel;