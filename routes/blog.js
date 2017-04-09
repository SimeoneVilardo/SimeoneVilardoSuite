var express = require('express');
var router = express.Router();
var config = require('../config.js');
var dbHelper = require('../helpers/database-helper.js');
var errorHelper = require('../helpers/error-helper.js');

router.get('/post', function (req, res, next) {
    dbHelper.findPost({_id: req.query.id}).then(function (post) {
        if(!post.validation.validated && (!req.isAuthenticated() || (req.user && req.user.role === config.roles.user && post.author._id !== post._id)))
            throw errorHelper.pageNotFound();
        res.renderHybrid('blog/post', {post: post});
    }).catch(function (err) {
        next(err);
    });
});

router.get('/newpost', function (req, res, next) {
    res.renderHybrid('management/post', {post: req.session.post});
});

router.post('/newpost', function (req, res, next) {
    if (req.isAuthenticated()) {
        dbHelper.createOrUpdatePost(req.user, req.body).then(function (result) {
            if(result.ok === 1)
                return dbHelper.findPost({_id: result.upserted[0]._id});
            else
                throw errorHelper.serverError('Errore nel salvataggio dell\'artcolo', 500);
        }).then(function (post) {
            res.renderHybrid('blog/post', {post: post});
        }).catch(function (err) {
            req.session.post = req.body;
            next(err);
        });
    }
    else {
        req.session.post = req.body;
        res.redirect('/login');
    }
});

module.exports = router;