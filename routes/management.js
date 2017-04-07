var securityHelper = require('../helpers/security-helper.js');
var dbHelper = require('../helpers/database-helper.js');

module.exports = function (router, passport) {
    router.get('/management/listposts', function (req, res, next) {
        dbHelper.findPosts().then(function (posts) {
            res.renderHybrid('management/posts', {posts:posts});
        }).catch(function (err) {
            next(err);
        });
    });

    router.get('/management/posts', function (req, res, next) {
        dbHelper.findPosts().then(function (posts) {
            res.renderHybrid('management/posts', {posts:posts});
        }).catch(function (err) {
            next(err);
        });
    });

    router.get('/management/editpost', function (req, res, next) {
        dbHelper.findPost({_id: req.query.postId}).then(function (post) {
            res.renderHybrid('blog/create_post', {post:post});
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/management/deletepost', securityHelper.isLogged, function (req, res, next) {
        dbHelper.deletePost({_id: req.query.postId}).then(function () {
            return dbHelper.findPosts();
        }).then(function (posts) {
            res.renderHybrid('management/posts', {posts:posts});
        }).catch(function (err) {
            next(err);
        });
    });
};