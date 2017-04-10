var utilityHelper = {};
var fs = require('fs');
var path = require('path');
var uglifyjs = require('uglify-js');
var uglifycss = require('uglifycss');
var winston = require('winston');
var logHelper = require('./log-helper.js');
var logger = new (require('winston').Logger)(logHelper.loggerConfig());


utilityHelper.extend = function () {
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;
    if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
        deep = arguments[0];
        i++;
    }
    var merge = function (obj) {
        for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                    extended[prop] = extend(true, extended[prop], obj[prop]);
                } else {
                    extended[prop] = obj[prop];
                }
            }
        }
    };
    for (; i < length; i++) {
        var obj = arguments[i];
        merge(obj);
    }
    return extended;
};

utilityHelper.createExpDate = function (num, size) {
    return new Date(Date.now() + num * size);
};

utilityHelper.optimizeScripts = function (sourcePaths, destPath) {
    logger.log('info', 'Ottimizzazione stylesheet...');
    var script = uglifyjs.minify(sourcePaths);
    if (script){
        logger.log('info', 'Script ottimizzati');
        fs.writeFile(destPath, script.code, function (err) {
            if(!err)
                logger.info('Script salvati in ' + destPath);
            else
                logger.error('Errore nel salvataggio degli script ottimizzati', err);
        });
    }
};

utilityHelper.optimizeStyles = function (sourcePaths, destPath) {
    logger.log('info', 'Ottimizzazione stylesheet...');
    var style = uglifycss.processFiles(sourcePaths);
    if(style){
        logger.info('Stylesheet ottimizzati');
        fs.writeFile(destPath, style, function (err) {
            if(!err)
                logger.info('Stylesheet salvati in ' + destPath);
            else
                logger.error('Errore nel salvataggio degli stylesheet ottimizzati', err);
        });
    }
};

module.exports = utilityHelper;