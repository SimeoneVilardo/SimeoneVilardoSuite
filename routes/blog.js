var express = require('express');
var router = express.Router();
var config = require('../config.js');
var dbHelper = require('../helpers/database-helper.js');
var errorHelper = require('../helpers/error-helper.js');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var upload = multer({dest: path.join(__dirname, '..', 'public', 'images', 'uploads')});


router.get('/post', function (req, res, next) {
    dbHelper.findPost({_id: req.query.id}).then(function (post) {
        if (!post.validation.validated && (!req.isAuthenticated() || (req.user && req.user.role === config.roles.user && post.author._id !== post._id)))
            throw errorHelper.pageNotFound();
        res.renderHybrid('blog/post', {post: post});
    }).catch(function (err) {
        next(err);
    });
});

router.post('/upload', upload.single('upload'), function (req, res, next) {
    var ext = req.file.originalname.substr(req.file.originalname.lastIndexOf('.') + 1);
    fs.rename(req.file.path, req.file.path + '.' + ext, function (err) {
        if (err) {
            next(err);
        } else {
            res.json({
                uploaded: 1,
                fileName: req.file.filename,
                url: '/images/uploads/' + req.file.filename + '.' + ext
            });
        }
    });
});

router.get('/newpost', function (req, res, next) {
    res.renderHybrid('management/post', {post: req.session.post});
});

router.post('/newpost', function (req, res, next) {
    if (req.isAuthenticated()) {
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
    }
    else {
        req.session.post = req.body;
        res.redirect('/login');
    }
});

module.exports = router;