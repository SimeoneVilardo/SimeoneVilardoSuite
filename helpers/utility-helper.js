﻿var utilityHelper = {};
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var uglifyjs = require('uglify-js');
var uglifycss = require('uglifycss');
var logHelper = require('./log-helper.js');

utilityHelper.sizedate = {};
utilityHelper.sizedate.msec = 1;
utilityHelper.sizedate.sec = utilityHelper.sizedate.msec * 1000;
utilityHelper.sizedate.min = utilityHelper.sizedate.sec * 60;
utilityHelper.sizedate.hour = utilityHelper.sizedate.min * 60;
utilityHelper.sizedate.day = utilityHelper.sizedate.hour * 24;
utilityHelper.sizedate.week = utilityHelper.sizedate.day * 7;
utilityHelper.sizedate.year = utilityHelper.sizedate.week * 92;

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

utilityHelper.isEmpty = function (str) {
    return (str.length === 0 || !str.trim());
};

utilityHelper.createExpDate = function (num, size) {
    return new Date(Date.now() + num * size);
};

utilityHelper.optimizeScripts = function (sourcePaths, destPath) {
    logHelper.getLogger().info('Ottimizzazione stylesheet...');
    var script = uglifyjs.minify(sourcePaths);
    if (script){
        logHelper.getLogger().info('Script ottimizzati');
        fs.writeFile(destPath, script.code, function (err) {
            if(!err)
                logHelper.getLogger().info('Script salvati in ' + destPath);
            else
                logHelper.getLogger().error('Errore nel salvataggio degli script ottimizzati', err);
        });
    }
};

utilityHelper.optimizeStyles = function (sourcePaths, destPath) {
    logHelper.getLogger().info('Ottimizzazione stylesheet...');
    var style = uglifycss.processFiles(sourcePaths);
    if(style){
        logHelper.getLogger().info('Stylesheet ottimizzati');
        fs.writeFile(destPath, style, function (err) {
            if(!err)
                logHelper.getLogger().info('Stylesheet salvati in ' + destPath);
            else
                logHelper.getLogger().error('Errore nel salvataggio degli stylesheet ottimizzati', err);
        });
    }
};

utilityHelper.extractDuplicateField = function (error) {
    assert(error, 'error cannot be undefined');
    assert(error.code, 'error.code cannot be undefined');
    assert(error.code === 11000, 'error should be a duplicate key error with code 11000');
    assert(error.message, 'error.message cannot be undefined');

    try {
        var field = error.message.split('.$')[1];
        field = field.split(' dup key')[0];
        field = field.substring(0, field.lastIndexOf('_'));
        return field;
    } catch (e) {
        throw new Error('could not parse error.message');
    }
};

module.exports = utilityHelper;