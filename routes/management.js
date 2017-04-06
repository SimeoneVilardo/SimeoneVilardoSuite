var securityHelper = require('../helpers/security-helper.js');
var dbHelper = require('../helpers/database-helper.js');

module.exports = function (router, passport) {
    router.get('/management/posts', function (req, res, next) {
        dbHelper.findPosts({validated: true}).then(function (posts) {
            res.renderHybrid('/management/posts', {posts:posts});
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/management/users', function (req, res, next) {

    });
};