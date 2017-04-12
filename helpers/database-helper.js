var dbHelper = {};
var config = require('../config.js');
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
    return Post.paginate(query, {select: fields, limit: config.paginator.page_size, page: page, lean: true, sort:sort});
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
    return dbHelper.findUser(query, {role: 1,validation:1}).then(function (user) {
        securityHelper.hasPermissionToEdit(currentUser, user, data.role);
        if(data.validate && user.validation.validated !== data.validate)
            data.validation = {validated: data.validate, validationDate: Date.now()};
        return User.update(query, data).exec();
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
    return Post.update(query, data).exec();
};

dbHelper.countPosts = function (query) {
    return Post.count(query).exec();
};

dbHelper.createOrUpdatePost = function (user, post) {
    var newPost = new Post();
    newPost.author = {_id: user._id, username: user.username};
    newPost.title = post.title;
    newPost.subtitle = post.subtitle;
    newPost.content = post.content;
    newPost.validation = {validated: ((user.role >= config.roles.admin.code) && (post.validate || !post._id))};
    if (newPost.validation.validated)
        newPost.validation.validationDate = Date.now();
    if (post._id)
        newPost._id = post._id;
    return Post.update({_id: newPost._id}, newPost, {upsert: true, setDefaultsOnInsert: true}).exec();
};

module.exports = dbHelper;