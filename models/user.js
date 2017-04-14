var mongoose = require('mongoose');
var config = require('../config.js');
var utilityHelper = require('../helpers/utility-helper.js');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true},
    password: { type: String},
    role: { type: Number, required: true, default: config.roles.user.code},
    creationDate: { type: Date, default: Date.now },
    updateDate: {type: Date},
    validation: {
        validated: {type: Boolean, default: false, required: true},
        validationDate: { type: Date }
    },
    validationToken: {
        token: {type: String},
        expirationDate: { type: Date }
    },
    facebook: {
        id: {type: String},
        token: {type: String},
        username: {type: String}
    },
    twitter: {
        id: {type: String},
        token: {type: String},
        username: {type: String}
    },
    google: {
        id: {type: String},
        token: {type: String},
        username: {type: String}
    }
});

var user = mongoose.model('user', userSchema);
module.exports = user;