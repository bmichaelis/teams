var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TeamSchema   = new Schema({
  name: String,
  captain: String,
  players: [String],
  thread: Number
});

module.exports = mongoose.model('Team', TeamSchema);
