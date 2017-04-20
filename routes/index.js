var express = require('express');
var router = express.Router();
var securityHelper = require('../helpers/security-helper.js');
var dbHelper = require('../helpers/database-helper.js');
var config = require('../config.js');

router.get('/', function (req, res, next) {
    var page = req.query.page || 1;
    dbHelper.findPostsPaginated({'validation.validated': true}, page, {}, {'validation.validationDate': -1}).then(function (result) {
        res.renderHybrid('index/home', {posts: result.docs, totalPages: result.pages, currentPage: result.page});
    }).catch(function (err) {
        next(err);
    });
});

router.get('/info', function (req, res, next) {
    res.renderHybrid('index/info');
});

router.get('/terms', function (req, res, next) {
    res.renderHybrid('index/terms');
});

router.get('/privacy', function (req, res, next) {
    res.renderHybrid('index/privacy');
});

router.get('/contacts', function (req, res, next) {
    res.renderHybrid('index/contacts');
});

router.get('/validate', function (req, res, next) {
    dbHelper.validateUser(req.query.token).then(function (id) {
        res.redirect('/login');
    }).catch(function (err) {
        next(err);
    });
});

module.exports = router;