var express = require('express');
var router = express.Router();
var securityHelper = require('../helpers/security-helper.js');
var dbHelper = require('../helpers/database-helper.js');
var config = require('../config.js');

router.get('/', function (req, res, next) {
    var page = req.query.page || 1;
    dbHelper.findPostsPaginated({'validation.validated': true}, page).then(function (result) {
        res.renderHybrid('index/home', {posts: result.docs, totalPages: result.pages, currentPage: result.page});
    }).catch(function (err) {
        next(err);
    });
});

router.get('/info', function (req, res, next) {
    res.renderHybrid('index/info');
});

router.get('/contacts', function (req, res, next) {
    res.renderHybrid('index/contacts');
});

router.get('/login', function (req, res, next) {
    res.renderHybrid('index/login', {passportMessage: req.flash('passportMessage')});
});

router.get('/signup', function (req, res, next) {
    res.renderHybrid('index/signup', {passportMessage: req.flash('passportMessage')});
});

router.get('/validate', function (req, res, next) {
    securityHelper.validateUser(req.query.token).then(function (result) {
        if (result.nModified === 1)
            res.redirect('/login');
        else
            next(errorHelper.serverError('Errore nella validazione', 500));
    }).catch(function (err) {
        next(err);
    })
});

router.get('/logout', securityHelper.isLogged, function (req, res, next) {
    req.session.destroy(function (err) {
        if (!err)
            res.redirect('/');
        else
            next(err);
    });
});

module.exports = router;