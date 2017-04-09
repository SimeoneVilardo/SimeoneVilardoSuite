var securityHelper = {};
var bcrypt = require('bcrypt-nodejs');
var dbHelper = require('./database-helper.js');
var errorHelper = require('./error-helper.js');
var config = require('../config');

securityHelper.isLogged = function(req, res, next) {
    if (req.isAuthenticated())
        next();
    else
        res.redirect('/login');
};

securityHelper.isAuthor = function(req, res, next) {
    dbHelper.findPost({_id: req.body.postId}).then(function (post) {
       if(req.user.id === post.author._id)
           next();
       else
           next(errorHelper.unauthorized());
    }).catch(function (err) {
        next(err);
    });
};


securityHelper.isInRole = function(req, res, next) {
    if(req.user.role >= res.locals.role)
        next();
    else
        next(errorHelper.unauthorized());
};

securityHelper.setAdmin = function(req, res, next) {
    res.locals.role = config.roles.admin.code;
    next();
};

securityHelper.setSuperAdmin = function(req, res, next) {
    res.locals.role = config.roles.superadmin.code;
    next();
};

securityHelper.hashPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

securityHelper.checkPassword = function (password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
};

securityHelper.validateUser = function (token) {
   return dbHelper.updateUser({'validationToken.token':token,"validationToken.expirationDate": { $gt: Date.now() } }, {$unset: {validationToken: 1 }, validated:true});
};

module.exports = securityHelper;