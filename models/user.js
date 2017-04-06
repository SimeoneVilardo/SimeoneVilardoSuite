var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    email: String,
    password: String,
    creationDate: { type: Date, default: Date.now }
});

var user = mongoose.model('user', userSchema);
module.exports = user;