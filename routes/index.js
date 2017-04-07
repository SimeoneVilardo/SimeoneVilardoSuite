var pug = require('pug');
var path = require('path');
var securityHelper = require('../helpers/security-helper.js');
var dbHelper = require('../helpers/database-helper.js');

module.exports = function (router, passport) {
    router.get('/', function (req, res, next) {
        dbHelper.findPosts({validated: true}).then(function (posts) {

            res.renderHybrid('index/home', {posts:posts});
        }).catch(function (err) {
            next(err);
        });
    });

    router.get('/login', function (req, res, next) {
        res.renderHybrid('index/login', { passportMessage: req.flash('passportMessage') });
    });

    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    router.get('/signup', function (req, res, next) {
        res.renderHybrid('index/signup', { passportMessage: req.flash('passportMessage') });
    });

    router.get('/logout', securityHelper.isLogged, function(req, res, next) {
        req.session.destroy(function (err) {
            if(err) return next(err);
            res.redirect('/'); //Inside a callback… bulletproof!
        });
    });

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
};