var logHelper = {};
var path = require('path');
var winston = require('winston');

logHelper.getLogger = function () {
    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                json: false,
                formatter: function (options) {
                    return (new Date()).toLocaleString('it-IT') + ' ' + options.level.toUpperCase() + ' ' + options.message + ((options.meta && options.meta.res && options.meta.res.statusCode) ? ' STATUS ' + options.meta.res.statusCode + ' ' : '') + ((options.level === 'error' && options.meta) ? JSON.stringify(options.meta) : '');
                },
                filename: path.join(__dirname, '..', 'logs', 'simeonevilardo.log'),
                maxsize: 100000000,
                level: process.env.LOG_LEVEL || 'info'
            })
        ]
    });
    return logger;
};

module.exports = logHelper;