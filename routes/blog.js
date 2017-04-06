var securityHelper = require('../helpers/security-helper.js');

module.exports = function (router, passport) {
    router.get('/blog/createpost', function (req, res, next) {
        res.renderHybrid('blog/create_post', {post: req.session.post});
    });

    router.post('/blog/createpost', function (req, res, next) {
        req.session.post = req.body;
        res.redirect('/');
    });
};