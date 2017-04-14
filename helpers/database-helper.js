var dbHelper = {};
var config = require('../config.js');
var errorHelper = require('./error-helper.js');
var User = require('../models/user');
var Post = require('../models/post');
var securityHelper = require('./security-helper.js');

dbHelper.findUser = function (query, fields) {
    return User.findOne(query).select(fields).lean().exec();
};

dbHelper.findUsers = function (query, fields) {
    return User.find(query).select(fields).lean().exec();
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

dbHelper.deleteUser = function (query, currentUser) {
    return dbHelper.findUser(query, {role: 1}).then(function (user) {
        securityHelper.hasPermissionToDelete(currentUser, user);
        return User.remove(query).exec();
    });
};

dbHelper.updateUser = function (query, data, currentUser) {
    return dbHelper.findUser(query, {role: 1, validation: 1}).then(function (user) {
        securityHelper.hasPermissionToEdit(currentUser, user, data.role);
        if (data.hasOwnProperty('validate') && user.validation.validated !== data.validate){
            data.validation = {validated: data.validate, validationDate: data.validate ? Date.now() : undefined};
            delete data.validate;
        }
        return [user._id, User.update(query, data).exec()];
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

dbHelper.updatePost = function (query, data) {
    return dbHelper.findPost(query, {validation: 1}).then(function (post) {
        if(data.hasOwnProperty('validate') && post.validation.validated !== data.validate){
            data.validation = {validated: data.validate, validationDate: data.validate ? Date.now() : undefined};
            delete data.validate;
        }
        return [post._id, Post.update(query, data).exec()];
    }).spread(function (id, result) {
        if(result.ok === 1)
            return id;
        throw errorHelper.serverError('Errore nella modifica dell\'articolo');
    })
};

dbHelper.countPosts = function (query) {
    return Post.count(query).exec();
};

dbHelper.createPost = function (user, post) {
    var validate = (user.role >= config.roles.admin.code) && (post.validate === true);
    var newPost = new Post({
        author: {_id: user._id, username: user.username},
        title: post.title,
        subtitle: post.subtitle,
        content: post.content,
        validation: {validated: validate, validationDate: validate ? Date.now() : undefined}
    });
    return newPost.save();
};

module.exports = dbHelper;