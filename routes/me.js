var express = require('express');
var router = express.Router();
var securityHelper = require('../helpers/security-helper.js');
var dbHelper = require('../helpers/database-helper.js');
var errorHelper = require('../helpers/error-helper.js');
var utilityHelper = require('../helpers/utility-helper.js');
var config = require('../config.js');

router.get('/profile', securityHelper.isLogged, function (req, res, next) {
    res.renderHybrid('me/profile');
});

router.post('/change-username', securityHelper.isLogged, function (req, res, next) {
    dbHelper.updateUser({_id: req.user._id}, {username: req.body.username}, req.user).then(function (id) {
        res.renderHybrid('me/profile');
    }).catch(function (err) {
        next(err);
    });
});

router.post('/change-email', securityHelper.isLogged, function (req, res, next) {
    dbHelper.updateUser({_id: req.user._id}, {email: req.body.email, validation: {validated: false}}, req.user).then(function (id) {
        res.renderHybrid('me/profile');
    }).catch(function (err) {
        next(err);
    });
});

router.post('/change-password', securityHelper.isLogged, function (req, res, next) {
    dbHelper.updateUser({_id: req.user._id}, {password: req.body.password, confirmPassword: req.body.confirmPassword}, req.user).then(function (id) {
        res.renderHybrid('me/profile');
    }).catch(function (err) {
        next(err);
    });
});

router.post('/delete-account', securityHelper.isLogged, function (req, res, next) {
    dbHelper.deleteUser({_id: req.user._id}, req.user).then(function (id) {
        res.redirect('/logout');
    }).catch(function (err) {
        next(err);
    });
});

module.exports = router;