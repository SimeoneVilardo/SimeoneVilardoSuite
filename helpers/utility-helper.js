var utilityHelper = {};
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var uglifyjs = require('uglify-js');
var uglifycss = require('uglifycss');

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
    console.log('Ottimizzazione script...');
    return Promise.try(function () {
        var script = uglifyjs.minify(sourcePaths);
        if (script){
            console.log('Script ottimizzati');
            return fs.writeFileAsync(destPath, script.code);
        }
    }).then(function () {
        console.log('Script salvati in ' + destPath);
    }).catch(function (err) {
        console.log('Errore nel salvataggio degli script ottimizzati', err);
    });
};

utilityHelper.optimizeStyles = function (sourcePaths, destPath) {
    console.log('Ottimizzazione stylesheet...');
    return Promise.try(function () {
        var style = uglifycss.processFiles([
            path.join(__dirname, '..', 'public', 'stylesheets', 'bootstrap', 'bootstrap.min.css'),
            path.join(__dirname, '..', 'public', 'stylesheets', 'bootstrap-select', 'bootstrap-select.min.css'),
            path.join(__dirname, '..', 'public', 'stylesheets', 'bootstrap-toggle', 'bootstrap-toggle.min.css'),
            path.join(__dirname, '..', 'public', 'stylesheets', 'font-awesome', 'font-awesome.min.css'),
            path.join(__dirname, '..', 'public', 'stylesheets', 'simeonevilardoweb.css')]
        );
        if (style){
            console.log('Stylesheet ottimizzati');
            return fs.writeFileAsync(destPath, style);
        }
    }).then(function () {
        console.log('Stylesheet salvati in ' + destPath);
    }).catch(function (err) {
        console.log('Errore nel salvataggio degli stylesheet ottimizzati', err);
    });
};

module.exports = utilityHelper;