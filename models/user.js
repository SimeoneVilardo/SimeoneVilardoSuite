var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    admin: Boolean,
    creationDate: { type: Date, default: Date.now }
});

var user = mongoose.model('user', userSchema);
module.exports = user;