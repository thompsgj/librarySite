var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	name: String,
	idnumber: Number,
	phone: Number,
	email: String,
});

var UsersDB = mongoose.model('UsersDB', userSchema);
module.exports = UsersDB;
