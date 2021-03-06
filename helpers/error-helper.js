var errorHelper = {};
var config = require('../config.js');

errorHelper.pageNotFound = function() {
    return {message: config.http.error.not_found, status: 404};
};

errorHelper.unauthorized = function(message) {
    return {message: message || config.http.error.unauthorized, status: 401};
};

errorHelper.badRequest = function(message) {
    return {message: message || config.http.error.badRequest, status: 403};
};

errorHelper.serverError = function(message, status) {
    return {message: message, status: status};
};

module.exports = errorHelper;