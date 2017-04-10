var logHelper = {};
var path = require('path');
var winston = require('winston');

logHelper.loggerConfig = function () {
    var logConfig = {
        transports: [ (!process.env.ENV || process.env.ENV === 'development')? new winston.transports.Console({colorize: true}) : new winston.transports.File({
            filename: path.join(__dirname, '..', 'logs', 'simeonevilardo.log')
        })],
            level: process.env.LOG_LEVEL || 'info',
            handleExceptions: true
    };
    return logConfig;
};

module.exports = logHelper;