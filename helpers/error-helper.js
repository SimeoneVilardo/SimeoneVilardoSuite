var errorHelper = {};
var config = require('../config.js');

errorHelper.pageNotFound = function() {
    return {message: config.http.error.not_found, status: 404};
};

errorHelper.unauthorized = function() {
    return {message: config.http.error.unauthorized, status: 401};
};

errorHelper.serverError = function(message, status) {
    return {message: message, status: status};
};

module.exports = errorHelper;