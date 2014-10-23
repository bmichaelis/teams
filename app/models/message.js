var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageSchema   = new Schema({
	thread: String,
	player: String,
	phone: String,
	message: String,
	sent: Boolean
});

module.exports = mongoose.model('Message', MessageSchema);
