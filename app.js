var express = require('express');
var helmet = require('helmet');
var path = require('path');
var pug = require('pug');
var logHelper = require('./helpers/log-helper.js');
var expressWinston = require('express-winston');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bluebird = require('bluebird');
bluebird.config({
    cancellation: true
});
mongoose.Promise = bluebird;
var passport = require('passport');
var csrf = require('csurf');
var flash = require('connect-flash');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var utilityHelper = require('./helpers/utility-helper.js');
var mailHelper = require('./helpers/mail-helper.js');
var config = require('./config.js');

mongoose.connect(config.mongodb.connection_string).then(function () {
    logHelper.getLogger().info('Connessione a MongoDB riuscita');
}).catch(function (err) {
    logHelper.getLogger().error('Errore connessione a MongoDB', err);
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
    path.join(__dirname, 'public', 'javascripts', 'bootstrap-dialog', 'bootstrap-dialog.min.js'),
    path.join(__dirname, 'public', 'javascripts', 'jquery-bootpag', 'jquery.bootpag.min.js'),
    path.join(__dirname, 'public', 'javascripts', 'cookieconsent', 'cookieconsent.min.js'),
    path.join(__dirname, 'public', 'javascripts', 'ajax-engine.js'),
    path.join(__dirname, 'public', 'javascripts', 'simeonevilardoweb.js')], path.join(__dirname, 'public', 'javascripts', 'scripts.js'));

utilityHelper.optimizeStyles([
    path.join(__dirname, 'public', 'stylesheets', 'bootstrap', 'bootstrap.min.css'),
    path.join(__dirname, 'public', 'stylesheets', 'bootstrap-select', 'bootstrap-select.min.css'),
    path.join(__dirname, 'public', 'stylesheets', 'bootstrap-toggle', 'bootstrap-toggle.min.css'),
    path.join(__dirname, 'public', 'stylesheets', 'bootstrap-dialog', 'bootstrap-dialog.min.css'),
    path.join(__dirname, 'public', 'stylesheets', 'font-awesome', 'font-awesome.min.css'),
    path.join(__dirname, 'public', 'stylesheets', 'cookieconsent', 'cookieconsent.min.css'),
    path.join(__dirname, 'public', 'stylesheets', 'simeonevilardoweb.css')], path.join(__dirname, 'public', 'stylesheets', 'styles.css'));

app.use(function (req, res, next) {
    res.renderHybrid = function (view, locals, callback) {
        req.back = !!req.headers['back-req'];
        req.ajax = !!req.xhr;
        locals = locals ? utilityHelper.extend(locals, {
            ajax: req.ajax,
            url: req.originalUrl,
            back: req.back,
            noUpdate: !!locals.noUpdate,
            currentUser: req.user,
            roles: config.roles
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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressWinston.logger({
    transports: [logHelper.getLogger().transports.file]
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: config.session.secret,
    name: 'SVC',
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: (app.get('env') === 'production'),
        domain: (app.get('env') === 'production') ? 'simeonevilardo.com' : 'localhost',
        expires: utilityHelper.createExpDate(1, utilityHelper.sizedate.week)
    }
}));
app.use(csrf());
app.use(function(req, res, next) {
    res.locals._csrf = req.csrfToken();
    next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', require('./routes/index.js'));
app.use('/blog', require('./routes/blog.js'));
app.use('/management', require('./routes/management.js'));
app.use('/me', require('./routes/me.js'));
require('./routes/auth.js')(app, passport);

app.use(function (req, res, next) {
    var err = new Error(config.http.error.not_found);
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        err.status = err.status || 500;
        logHelper.getLogger().error(err);
        res.status(err.status);
        if (err.redirect)
            res.redirect(err.redirect);
        else
            res.renderHybrid('error', {
                errMessage: err.message,
                error: err
            });
    });
}

app.use(function (err, req, res, next) {
    err.status = err.status || 500;
    logHelper.getLogger().error(err);
    res.status(err.status);
    if (err.redirect)
        res.redirect(err.redirect);
    else
        res.renderHybrid('error', {
            errMessage: err.message,
            error: {}
        });
});

module.exports = app;