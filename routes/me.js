var express = require('express');
var router = express.Router();
var securityHelper = require('../helpers/security-helper.js');
var dbHelper = require('../helpers/database-helper.js');
var mailHelper = require('../helpers/mail-helper.js');
var config = require('../config.js');

router.get('/profile', securityHelper.isLogged, function (req, res, next) {
    res.renderHybrid('me/profile');
});

router.get('/recover-password-request', securityHelper.isNotLogged, function (req, res, next) {
    res.renderHybrid('me/recover-password-req');
});

router.post('/recover-password-request', securityHelper.isNotLogged, function (req, res, next) {
    dbHelper.findUser({$or: [{username: req.body.userinfo}, {email: req.body.userinfo}]}, {username: 1, email: 1}).then(function (user) {
        var token = securityHelper.generateToken();
        return [user, dbHelper.updateUser({_id: user._id}, {recoverPasswordToken: {token: token, expirationDate: Date.now()}}, null, {resetPassword: true}).return(token)];
    }).spread(function (user, token) {
            return mailHelper.sendRecoverPassword(user.username, user.email, token);
    }).then(function(err){
        if(err)
            throw err;
        res.renderHybrid('me/recover-password-req', {alert: {message: 'La mail è stata inviata correttamente', type:'alert-success'} });
    }).catch(function (err) {
        next(err);
    })
});

router.get('/recover-password', securityHelper.isNotLogged, function (req, res, next) {
    var currentDate = Date.now();
    dbHelper.findUser({
        'validationToken.token': req.query.token,
        "validationToken.expirationDate": {$gt: currentDate}
    });
    });

router.get('/recover-username', securityHelper.isNotLogged, function (req, res, next) {
    res.renderHybrid('me/recover-username-req');
});

router.get('/profile', securityHelper.isLogged, function (req, res, next) {
    res.renderHybrid('me/profile');
});

router.post('/recover-username', securityHelper.isNotLogged, function (req, res, next) {
    dbHelper.findUser({email: req.body.email}, {username: 1, email: 1}).then(function (user) {
        return mailHelper.sendRecoverUsername(user.username, user.email);
    }).then(function (err) {
        if(err)
            throw err;
        res.renderHybrid('me/recover-username', {alert: {message: 'La mail è stata inviata correttamente', type:'alert-success'} });
    }).catch(function (err) {
        next(err);
    })
});

router.post('/recover-password', securityHelper.isNotLogged, function (req, res, next) {
    dbHelper.findUser({$or: [{username: req.body.userdata}, {email: req.body.userdata}]}).then(function (user) {

    });
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
        res.renderHybrid('me/profile', {alert: {message: 'Il tuo indirizzo email è stato modificato', type:'alert-success'} });
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
        res.redirect('/auth/logout');
    }).catch(function (err) {
        next(err);
    });
});

module.exports = router;