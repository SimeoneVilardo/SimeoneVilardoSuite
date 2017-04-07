var errorHelper = {};
var config = require('../config.js');

errorHelper.pageNotFound = function(req, res, next) {
    return {message: config.http.error.not_found, status: 404};
};

module.exports = errorHelper;