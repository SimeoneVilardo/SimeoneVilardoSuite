var dbHelper = {};
var User = require('../models/user');

dbHelper.findUser = function (query, fields) {
    return User.findOne(query).select(fields).lean().exec();
};

module.exports = dbHelper;