var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PlayerSchema   = new Schema({
	firstName: String,
	lastName: String,
	gender: String,
	cellPhone: String,
	active: Boolean,
	cellPhone: String
});

module.exports = mongoose.model('Player', PlayerSchema);
