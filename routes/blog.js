var express = require('express');
var router = express.Router();
var config = require('../config.js');
var dbHelper = require('../helpers/database-helper.js');
var errorHelper = require('../helpers/error-helper.js');
var bluebird = require('bluebird');
var fs = require('fs');
var renamePromise = bluebird.promisify(fs.rename);
var mkdirp = require('mkdirp');
var path = require('path');
const readChunk = require('read-chunk');
const fileType = require('file-type');
var multer = require('multer');
var upload = multer({dest: path.join(__dirname, '..', 'tmp')});

router.get('/post', function (req, res, next) {
    dbHelper.findPost({_id: req.query.id}).then(function (post) {
        if (!post.validation.validated && (!req.isAuthenticated() || (req.user && req.user.role === config.roles.user && post.author._id !== post._id)))
            throw errorHelper.pageNotFound();
        res.renderHybrid('blog/post', {post: post});
    }).catch(function (err) {
        next(err);
    });
});

router.post('/upload', upload.single('file'), function (req, res, next) {
    return bluebird.try(function() {
        return fileType(readChunk.sync(req.file.path, 0, 4100));
    }).then(function (type) {
        if(!type.mime.startsWith('image')){
            fs.unlink(req.file.path);
            throw errorHelper.serverError('Il file caricato non è un\'immagine');
        }
        var currentDate = new Date();
        var dateDir = path.join(String(currentDate.getFullYear()), String(currentDate.getMonth() + 1), String(currentDate.getDate()));
        var absPath = path.join(__dirname, '..', 'public', 'images', 'uploads', dateDir);
        if(!fs.existsSync(absPath))
            mkdirp.sync(absPath);
        return renamePromise(req.file.path, path.join(absPath, req.file.filename + '.' + type.ext)).return(path.join('/', 'images', 'uploads', dateDir, req.file.filename + '.' + type.ext));
    }).then(function (location) {
        res.json({
            location: location
        });
    }).catch(function (err) {
        next(err);
    });
});

router.get('/newpost', function (req, res, next) {
    res.renderHybrid('management/post', {post: req.session.post});
});

router.post('/newpost', function (req, res, next) {
    var post = {title: req.body.title, subtitle: req.body.subtitle, content: req.body.content, validation: {validated: req.body.validate === 'on'}};
    dbHelper.createPost(req.user, post).then(function (post) {
        delete req.session.post;
        res.renderHybrid('blog/post', {post: post.toObject()});
    }).catch(function (err) {
        req.session.post = req.body;
        next(err);
    });
});

module.exports = router;