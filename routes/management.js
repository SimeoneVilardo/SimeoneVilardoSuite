var express = require('express');
var router = express.Router();
var securityHelper = require('../helpers/security-helper.js');
var dbHelper = require('../helpers/database-helper.js');
var errorHelper = require('../helpers/error-helper.js');
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

router.get('/profile', securityHelper.isLogged, function (req, res, next) {
    res.renderHybrid('management/profile');
});

router.get('/editpost', securityHelper.isLogged, securityHelper.setAdmin, securityHelper.isInRole, function (req, res, next) {
    dbHelper.findPost({_id: req.query.id}).then(function (post) {
        res.renderHybrid('management/post', {post: post});
    }).catch(function (err) {
        next(err);
    });
});

router.get('/edituser', securityHelper.isLogged, securityHelper.setAdmin, securityHelper.isInRole, function (req, res, next) {
    dbHelper.findUser({_id: req.query.id}).then(function (user) {
        res.renderHybrid('management/user', {user: user, roles: config.roles});
    }).catch(function (err) {
        next(err);
    });
});

router.post('/edituser', securityHelper.isLogged, securityHelper.setAdmin, securityHelper.isInRole, function (req, res, next) {
    var data = {username: req.body.username, email: req.body.email, role: parseInt(req.body.role), updateDate: Date.now(), validate: req.body.validated === 'on'};
    if(req.body.password && req.body.confirmPassword && req.body.password === req.body.confirmPassword)
        data.password = securityHelper.hashPassword(req.body.password);
    dbHelper.updateUser({_id:req.query.id}, data, req.user).then(function (result) {
        if(result.nModified === 1)
            res.redirect('/management/users');
        else
            throw errorHelper.serverError('Errore nella modifica dell\'utente', 500);
    }).catch(function (err) {
        next(err);
    });
});

router.post('/deletepost', securityHelper.isLogged, securityHelper.setAdmin, securityHelper.isInRole, function (req, res, next) {
    dbHelper.deletePost({_id: req.query.id}, req.user).then(function () {
        return dbHelper.findPosts();
    }).then(function (posts) {
        res.renderHybrid('management/posts', {posts: posts});
    }).catch(function (err) {
        next(err);
    });
});

router.post('/editpost', securityHelper.isLogged, securityHelper.setAdmin, securityHelper.isInRole, function (req, res, next) {
    dbHelper.createOrUpdatePost(req.user, req.body).then(function (result) {
        if (result.ok === 1) {
            delete req.session.post;
            return dbHelper.findPost({_id: result.upserted[0]._id});
        }
        else
            throw errorHelper.serverError('Errore nel salvataggio dell\'artcolo', 500);
    }).then(function (post) {
        res.renderHybrid('blog/post', {post: post});
    }).catch(function (err) {
        req.session.post = req.body;
        next(err);
    });
});

router.post('/banuser', securityHelper.isLogged, securityHelper.setAdmin, securityHelper.isInRole, function (req, res, next) {
    dbHelper.updateUser({_id:req.query.id}, {role: -1}, req.user).then(function (result) {
        if(result.ok === 1)
            res.redirect('/management/users');
        else
            throw errorHelper.serverError('Errore nella modifica dell\'utente', 500);
    }).catch(function (err) {
        next(err);
    });
});

router.post('/unbanuser', securityHelper.isLogged, securityHelper.setAdmin, securityHelper.isInRole, function (req, res, next) {
    dbHelper.updateUser({_id:req.query.id}, {role: 1}, req.user).then(function (result) {
        if(result.ok === 1)
            res.redirect('/management/users');
        else
            throw errorHelper.serverError('Errore nella modifica dell\'utente', 500);
    }).catch(function (err) {
        next(err);
    });
});

router.post('/deleteuser', securityHelper.isLogged, securityHelper.setAdmin, securityHelper.isInRole, function (req, res, next) {
    dbHelper.deleteUser({_id: req.query.id}, req.user).then(function (cmdResult) {
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