var express = require('express');
var router = express.Router();
var securityHelper = require('../helpers/security-helper.js');
var dbHelper = require('../helpers/database-helper.js');
var config = require('../config.js');

router.get('/posts', securityHelper.isLogged, securityHelper.setAdmin, securityHelper.isInRole, function (req, res, next) {
    dbHelper.findPosts().then(function (posts) {
        res.renderHybrid('management/posts', {posts: posts, roles: config.roles});
    }).catch(function (err) {
        next(err);
    });
});

router.get('/users', securityHelper.isLogged, securityHelper.setAdmin, securityHelper.isInRole, function (req, res, next) {
    dbHelper.findUsers().then(function (users) {
        res.renderHybrid('management/users', {users: users, roles: config.roles});
    }).catch(function (err) {
        next(err);
    });
});

router.get('/editpost', function (req, res, next) {
    dbHelper.findPost({_id: req.query.id}).then(function (post) {
        res.renderHybrid('blog/post', {post: post});
    }).catch(function (err) {
        next(err);
    });
});

router.get('/edituser', function (req, res, next) {
    dbHelper.findUser({_id: req.query.id}).then(function (user) {
        res.renderHybrid('management/user', {user: user, roles: config.roles});
    }).catch(function (err) {
        next(err);
    });
});

router.post('/edituser', securityHelper.isLogged, function (req, res, next) {
    dbHelper.findUser({_id:req.query.id}).then(function (user) {
        var data = {username: req.body.username, email: req.body.email, role: req.body.role, updateDate: Date.now()};
        if(user.validation.validated !== (req.body.validated === 'on'))
            data.validation = {validated: req.body.validated === 'on', validationDate: Date.now()};
        if(req.body.password && req.body.confirmPassword && req.body.password === req.body.confirmPassword)
            data.password = securityHelper.hashPassword(req.body.password);
        return dbHelper.updateUser({_id:req.query.id}, data);
    }).then(function (result) {
        if(result.nModified === 1)
            res.redirect('/management/users');
        else
            throw errorHelper.serverError('Errore nella modifica dell\'utente', 500);
    }).catch(function (err) {
        next(err);
    });
});

router.post('/deletepost', securityHelper.isLogged, function (req, res, next) {
    dbHelper.deletePost({_id: req.query.id}).then(function () {
        return dbHelper.findPosts();
    }).then(function (posts) {
        res.renderHybrid('management/posts', {posts: posts});
    }).catch(function (err) {
        next(err);
    });
});

router.post('/banuser', securityHelper.isLogged, function (req, res, next) {
    dbHelper.updateUser({_id:req.query.id}, {role: -1}).then(function (result) {
        if(result.ok === 1)
            res.redirect('/management/users');
        else
            throw errorHelper.serverError('Errore nella modifica dell\'utente', 500);
    }).catch(function (err) {
        next(err);
    });
});

router.post('/deleteuser', securityHelper.isLogged, function (req, res, next) {
    dbHelper.deleteUser({_id: req.query.id}).then(function (cmdResult) {
        if(cmdResult.result.ok === 1)
            res.redirect('/management/users');
        else
            throw errorHelper.serverError('Errore nella rimozione dell\'utente', 500);
    }).catch(function (err) {
        next(err);
    });
});

router.get('/validate', securityHelper.isLogged,securityHelper.setAdmin, securityHelper.isInRole, function (req, res, next) {
    dbHelper.updatePost({_id: req.query.id}, {'validation.validated': true, 'validation.validationDate': Date.now()}).then(function (result) {
        if(result.nModified === 1)
            res.redirect('/management/posts');
        else
            throw errorHelper.serverError('Errore nella convalida dell\'articolo', 500);
    }).catch(function (err) {
        next(err);
    });
});

router.get('/disable', securityHelper.isLogged,securityHelper.setAdmin, securityHelper.isInRole, function (req, res, next) {
    dbHelper.updatePost({_id: req.query.id}, {'validation.validated': false, $unset: {'validation.validationDate': 1 }}).then(function (result) {
        if(result.nModified === 1)
            res.redirect('/management/posts');
        else
            throw errorHelper.serverError('Errore nella disabilitazione dell\'articolo', 500);
    }).catch(function (err) {
        next(err);
    });
});


module.exports = router;