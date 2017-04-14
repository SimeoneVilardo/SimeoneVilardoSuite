var securityHelper = {};
var bcrypt = require('bcrypt-nodejs');
var errorHelper = require('./error-helper.js');
var config = require('../config');

securityHelper.isLogged = function(req, res, next) {
    if (req.isAuthenticated())
        next();
    else
        res.redirect('/login');
};

securityHelper.mustChangeUsername = function(req, res, next) {
    if(req.session.social && (req.session.social.facebook && req.session.social.facebook.duplicate) || (req.session.social.twitter && req.session.social.twitter.duplicate) || (req.session.social.google && req.session.social.google.duplicate))
        next();
    else
        res.redirect('/');
};

securityHelper.isUsernameDuplicated = function(req, res, next) {
    if(req.session.social && req.session.social[req.session.social.service] && req.session.social[req.session.social.service].duplicate)
        next();
    else
        res.redirect('/');
};

securityHelper.isValidated = function(req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.validation.validated)
        next();
    else
        next(errorHelper.unauthorized('Utente non convalidato'));
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

securityHelper.hasPermissionToEdit = function (currentUser, targetUser, newRole) {
    if(targetUser.role === config.roles.superadmin.code)
        throw errorHelper.unauthorized('Impossibile modificare un superadmin');
    if(newRole > currentUser.role)
        throw errorHelper.unauthorized('Impossibile assegnare ad un utente un ruolo superiore al proprio');
    if(targetUser.role > currentUser.role)
        throw errorHelper.unauthorized('Impossibile modificare un utente di ruolo superiore al proprio');
};

securityHelper.hasPermissionToDelete = function (currentUser, targetUser) {
    if(targetUser.role === config.roles.superadmin.code)
        throw errorHelper.unauthorized('Impossibile eliminare un superadmin');
    if(targetUser.role > currentUser.role)
        throw errorHelper.unauthorized('Impossibile eliminare un utente di ruolo superiore al proprio');
};

module.exports = securityHelper;