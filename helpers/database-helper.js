var dbHelper = {};
var User = require('../models/user');

dbHelper.findUser = function (query, fields) {
    return User.findOne(query).select(fields).lean().exec();
};

dbHelper.createPost = function (query, fields) {

};

module.exports = dbHelper;