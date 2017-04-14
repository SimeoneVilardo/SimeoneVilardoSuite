var dbHelper = {};
var config = require('../config.js');
var bluebird = require('bluebird');
var errorHelper = require('./error-helper.js');
var User = require('../models/user');
var Post = require('../models/post');
var securityHelper = require('./security-helper.js');
var utilityHelper = require('./utility-helper.js');

dbHelper.findUser = function (query, fields) {
    return User.findOne(query).select(fields).lean().exec();
};

dbHelper.findUsers = function (query, fields) {
    return User.find(query).select(fields).lean().exec();
};

dbHelper.deleteUser = function (query, currentUser) {
    return dbHelper.findUser(query, {role: 1}).then(function (user) {
        securityHelper.hasPermissionToDelete(currentUser, user);
        return User.remove(query).exec();
    });
};

dbHelper.createUser = function (user, options) {
    return bluebird.try(function() {
        if(!options || !options.social){
            user.validationToken = {token: securityHelper.generateToken(), expirationDate: utilityHelper.createExpDate(1, utilityHelper.sizedate.day)};
            if(utilityHelper.isEmpty(user.password) || user.password !== user.confirmPassword)
                throw errorHelper.serverError('Le password non combaciano');
            user.password = securityHelper.hashPassword( user.password);
        }
        return (new User(user)).save();
    }).then(function (newUser) {
        return newUser.toObject();
    });
};

dbHelper.updateUser = function (query, update, currentUser, options) {
    return dbHelper.findUser(query, {role: 1, validation: 1}).then(function (user) {
        if(!options || !options.login){
            var err = securityHelper.hasPermissionToEdit(currentUser, user, update.role);
            if(err)
                throw err;
        }
        if(update.hasOwnProperty('validation') && update.validation.hasOwnProperty('validated') && user.validation.validated !== update.validation.validated)
            update.validation = {validated: update.validation.validated, validationDate: update.validation.validated ? Date.now() : undefined};
        if(update.hasOwnProperty('password')){
            if(utilityHelper.isEmpty(update.password) || update.password !== update.confirmPassword)
                throw errorHelper.serverError('Le password non combaciano');
            else
            {
                update.password = securityHelper.hashPassword(update.password);
                delete update.confirmPassword;
            }
        }
        update.hasOwnProperty('_id')
            delete update._id;
        return [user._id, User.update(query, update).exec()];
    }).spread(function (id, result) {
        if(result.ok === 1)
            return id;
        throw errorHelper.serverError('Errore nella modifica dell\'utente');
    });
};

dbHelper.validateUser = function (token) {
    var currentDate = Date.now();
    return dbHelper.updateUser({
            'validationToken.token': token,
            "validationToken.expirationDate": {$gt: currentDate}
        },
        {
            $unset: {validationToken: 1},
            $set: {
                'validation.validated': true,
                'validation.validationDate': currentDate
            }
        });
};

dbHelper.createPost = function (user, post) {
    return bluebird.try(function() {
        if(!user || !user.validation.validated)
            throw errorHelper.unauthorized('Utente non autenticato o convalidato');
        post.validation.validate = (user.role >= config.roles.admin.code) && (post.validation.validate === true);
        var newPost = new Post(post);
        newPost.author = {_id: user._id, username: user.username};
        if(newPost.validation.validate)
            newPost.validation.validationDate = Date.now();
        return newPost.save();
    });
};

dbHelper.findPost = function (query, fields) {
    return Post.findOne(query).select(fields).lean().exec();
};

dbHelper.findPosts = function (query, fields) {
    return Post.find(query).select(fields).lean().exec();
};

dbHelper.findPostsPaginated = function (query, page, fields, sort) {
    return Post.paginate(query, {
        select: fields,
        limit: config.paginator.page_size,
        page: page,
        lean: true,
        sort: sort
    });
};

dbHelper.deletePost = function (query) {
    return Post.find(query).remove().exec();
};


dbHelper.updatePost = function (query, update) {
    return dbHelper.findPost(query, {validation: 1}).then(function (post) {
        if(update.hasOwnProperty('validation') && update.validation.hasOwnProperty('validated') && post.validation.validated !== update.validation.validated)
            update.validation = {validated: update.validation.validated, validationDate: update.validation.validated ? Date.now() : undefined};
        return [post._id, Post.update(query, update).exec()];
    }).spread(function (id, result) {
        if(result.ok === 1)
            return id;
        throw errorHelper.serverError('Errore nella modifica dell\'articolo');
    })
};

dbHelper.countPosts = function (query) {
    return Post.count(query).exec();
};

module.exports = dbHelper;