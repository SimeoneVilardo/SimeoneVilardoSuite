var mongoose = require('mongoose');
var config = require('../config.js');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    role:{ type: Number, required: true, default: config.roles.user.code},
    validated: {type: Boolean, default: false, required: true},
    validationDate: { type: Date },
    creationDate: { type: Date, default: Date.now }
});

var user = mongoose.model('user', userSchema);
module.exports = user;