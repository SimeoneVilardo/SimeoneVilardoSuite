var securityHelper = require('../helpers/security-helper.js');
var dbHelper = require('../helpers/database-helper.js');
var errorHelper = require('../helpers/error-helper.js');

module.exports = function (router, passport) {
    router.get('/blog/createpost', function (req, res, next) {
        res.renderHybrid('blog/create_post', {post: req.session.post});
    });

    router.get('/blog/post', function (req, res, next) {
        dbHelper.findPost({_id: req.query.postId, validated: req.user && !!req.user.admin}).then(function (post) {
            if (!post)
                throw errorHelper.pageNotFound();
            res.renderHybrid('blog/post', {post: post});
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/blog/createpost', function (req, res, next) {
        if (req.isAuthenticated()) {
            dbHelper.createPost(req.user, req.body).then(function (result) {
                if (result.ok === 1 || result.nModified === 1)
                    res.redirect('/');
                else
                    req.session.post = req.body;
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            req.session.post = req.body;
            res.redirect('/login');
        }

    });
};