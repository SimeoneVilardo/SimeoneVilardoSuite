var express = require('express');
var helmet = require('helmet');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var path = require('path');
var logger = require('morgan');
var pug = require('pug');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bluebird = require('bluebird');
bluebird.config({
    cancellation: true
});
mongoose.Promise = bluebird;
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var utilityHelper = require('./helpers/utility-helper.js');
var mailHelper = require('./helpers/mail-helper.js');
var config = require('./config.js');

mongoose.connect(config.mongodb.connection_string).then(function () {
    console.log('Connessione a MongoDB riuscita');
}).catch(function (err) {
    console.log('Errore connessione a MongoDB', err);
});
mailHelper.init();
require('./auth/passport')(passport);

var app = express();
app.use(helmet());

utilityHelper.optimizeScripts([
    path.join(__dirname, 'public', 'javascripts', 'jquery', 'jquery-3.2.0.min.js'),
    path.join(__dirname, 'public', 'javascripts', 'bootstrap', 'bootstrap.min.js'),
    path.join(__dirname, 'public', 'javascripts', 'nanobar', 'nanobar.min.js'),
    path.join(__dirname, 'public', 'javascripts', 'bootstrap-toggle', 'bootstrap-toggle.min.js'),
    path.join(__dirname, 'public', 'javascripts', 'bootstrap-select', 'bootstrap-select.min.js'),
    path.join(__dirname, 'public', 'javascripts', 'ajax-engine.js'),
    path.join(__dirname, 'public', 'javascripts', 'simeonevilardoweb.js')], path.join(__dirname, 'public', 'javascripts', 'scripts.js'));

utilityHelper.optimizeStyles([
    path.join(__dirname, '..', 'public', 'stylesheets', 'bootstrap', 'bootstrap.min.css'),
    path.join(__dirname, '..', 'public', 'stylesheets', 'bootstrap-select', 'bootstrap-select.min.css'),
    path.join(__dirname, '..', 'public', 'stylesheets', 'bootstrap-toggle', 'bootstrap-toggle.min.css'),
    path.join(__dirname, '..', 'public', 'stylesheets', 'font-awesome', 'font-awesome.min.css'),
    path.join(__dirname, '..', 'public', 'stylesheets', 'simeonevilardoweb.js')], path.join(__dirname, 'public', 'stylesheets', 'styles.css'));

app.use(function (req, res, next) {
    res.renderHybrid = function (view, locals, callback) {
        req.back = !!req.headers['back-req'];
        req.ajax = !!req.xhr;
        locals = locals ? utilityHelper.extend(locals, {
            ajax: req.ajax,
            url: req.originalUrl,
            back: req.back,
            noUpdate: !!locals.noUpdate
        }) : {ajax: req.ajax, url: req.originalUrl, back: req.back, noUpdate: false};
        if (req.ajax)
            res.render(view, locals, callback);
        else
            res.render(config.views.layout, {
                partialView: pug.renderFile(path.join(__dirname, config.views.dir, view) + config.views.ext, locals),
                currentUser: req.user,
                roles: config.roles
            }, callback);
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
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: config.session.secret,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    resave: true,
    saveUninitialized: true,
    cookie: {expires: utilityHelper.createExpDate(1, config.sizedate.week)}
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

app.use('/', require('./routes/index.js'));
app.use('/blog', require('./routes/blog.js'));
app.use('/management', require('./routes/management.js'));

//app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error(config.http.error.not_found);
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.renderHybrid('error', {
            errMessage: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.renderHybrid('error', {
        errMessage: err.message,
        error: {}
    });
});

module.exports = app;