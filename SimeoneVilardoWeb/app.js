var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var pug = require('pug');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bluebird = require('bluebird');
mongoose.Promise = bluebird;
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var utilityHelper = require('./helpers/utility-helper.js');
var config = require('./config.js');

mongoose.connect(config.mongodb.connection_string);
require('./auth/passport')(passport);

var app = express();

app.use(function (req, res, next) {
    res.renderHybrid = function (view, locals, callback) {
        req.back = req.headers['back-req'] ? true : false;
        req.ajax = req.xhr ? true : false;
        locals = utilityHelper.extend(locals, { ajax: req.ajax, url: req.url, back: req.back });
        if (req.ajax)
            res.render(view, locals, callback);
        else
            res.render(config.views.layout, { partialView: pug.renderFile(path.join(__dirname, config.views.dir, view) + config.views.ext, locals) }, callback);
    };
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: config.session.secret,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./routes/index.js')(app, passport);

//app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            errMessage: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        errMessage: err.message,
        error: {}
    });
});

module.exports = app;