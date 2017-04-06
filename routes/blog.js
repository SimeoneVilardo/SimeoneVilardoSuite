var securityHelper = require('../helpers/security-helper.js');
var dbHelper = require('../helpers/database-helper.js');

module.exports = function (router, passport) {
    router.get('/blog/createpost', function (req, res, next) {
        res.renderHybrid('blog/create_post', {post: req.session.post});
    });

    router.get('/blog/post', function (req, res, next) {
        dbHelper.findPost({_id: req.query.postId, validated: true}).then(function (post) {
            res.renderHybrid('/blog/post', {post:post});
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/blog/createpost', function (req, res, next) {
        req.session.post = req.body;
        if(req.isAuthenticated())
            dbHelper.createPost(req.user, req.session.post).then(function () {
                res.redirect('/');
            });
        else
            res.redirect('/login');
    });
};