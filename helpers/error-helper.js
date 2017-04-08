var errorHelper = {};
var config = require('../config.js');

errorHelper.pageNotFound = function(req, res, next) {
    return {message: config.http.error.not_found, status: 404};
};

errorHelper.unauthorized = function(req, res, next) {
    return {message: config.http.error.unauthorized, status: 401};
};

module.exports = errorHelper;