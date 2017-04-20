var securityHelper = require('../helpers/security-helper.js');
var config = require('../config.js');

module.exports = function (router, passport) {
    router.get('/auth/login', securityHelper.isNotLogged, function (req, res, next) {
        res.renderHybrid('auth/login', {alert: {message: req.flash('passportMessage')[0], type: 'alert-danger'}});
    });

    router.get('/auth/signup', securityHelper.isNotLogged, function (req, res, next) {
        res.renderHybrid('auth/signup', {alert: {message: req.flash('passportMessage')[0], type: 'alert-danger'}});
    });

    router.get('/auth/logout', securityHelper.isLogged, function (req, res, next) {
        req.session.destroy(function (err) {
            if (!err)
                res.redirect('/');
            else
                next(err);
        });
    });

    router.post('/auth/local/login', securityHelper.isNotLogged, passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true
    }));

    router.post('/auth/local/signup', securityHelper.isNotLogged, passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/auth/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    router.get('/auth/facebook', securityHelper.isNotLogged, passport.authenticate('facebook', {
        scope: ['email', 'user_about_me']
    }));

    router.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            authType: 'rerequest',
            successRedirect: '/',
            failureRedirect: '/auth/login'
        }));

    router.get('/auth/twitter', securityHelper.isNotLogged, passport.authenticate('twitter', {
        scope: 'email'
    }));

    router.get('/auth/twitter/callback', securityHelper.isNotLogged,
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/auth/login'
        }));

    router.get('/auth/google', securityHelper.isNotLogged, passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

    router.get('/auth/google/callback', securityHelper.isNotLogged,
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/auth/login'
        }));

    router.get('/auth/username', securityHelper.isNotLogged, securityHelper.mustChangeUsername, function (req, res, next) {
        res.renderHybrid('auth/username');
    });

    router.post('/auth/username', securityHelper.isNotLogged, securityHelper.isUsernameDuplicated, function (req, res, next) {
        req.session.social[req.session.social.service].alias = req.body.username;
        res.redirect(config.host.https_baseurl + '/auth/' + req.session.social.service);
    });
};