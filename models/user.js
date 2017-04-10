var mongoose = require('mongoose');
var config = require('../config.js');
var utilityHelper = require('../helpers/utility-helper.js');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    role: { type: Number, required: true, default: config.roles.user.code},
    creationDate: { type: Date, default: Date.now },
    updateDate: {type: Date},
    validation: {
        validated: {type: Boolean, default: false, required: true},
        validationDate: { type: Date }
    },
    validationToken: {
        token: {type: String, default: crypto.randomBytes(config.token.size).toString('hex')},
        expirationDate: { type: Date, default: utilityHelper.createExpDate(1, config.sizedate.day) }
    }
});

var user = mongoose.model('user', userSchema);
module.exports = user;