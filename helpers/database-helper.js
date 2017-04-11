var dbHelper = {};
var config = require('../config.js');
var User = require('../models/user');
var Post = require('../models/post');

dbHelper.findUser = function (query, fields) {
    return User.findOne(query).select(fields).lean().exec();
};

dbHelper.findUsers = function (query, fields) {
    return User.find(query).select(fields).lean().exec();
};

dbHelper.findPosts = function (query, fields) {
    return Post.find(query).select(fields).lean().exec();
};

dbHelper.findPostsPaginated = function (query, page, fields) {
    return Post.count(query).exec().then(function (count) {
        return [count, Post.find(query, fields, {skip: config.paginator.page_size * (page-1), limit: config.paginator.page_size}).lean().exec()];
    });
};

dbHelper.findPost = function (query, fields) {
    return Post.findOne(query).select(fields).lean().exec();
};

dbHelper.deletePost = function (query) {
    return Post.find(query).remove().exec();
};

dbHelper.deleteUser = function (query) {
    return User.remove(query).exec();
};

dbHelper.updateUser = function (query, data) {
    return User.update(query, data).exec();
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
    newPost.validation = {validated: ((user.role >= config.roles.admin.code) && post.validate)};
    if(newPost.validation.validated)
        newPost.validation.validationDate = Date.now();
    if(post._id)
        newPost._id = post._id;
    return Post.update({_id: newPost._id}, newPost, {upsert: true, setDefaultsOnInsert: true}).exec();
};

module.exports = dbHelper;