var dbHelper = {};
var User = require('../models/user');
var Post = require('../models/post');

dbHelper.findUser = function (query, fields) {
    return User.findOne(query).select(fields).lean().exec();
};

dbHelper.findPosts = function (query, fields) {
    return Post.find(query).select(fields).lean().exec();
};

dbHelper.findPost = function (query, fields) {
    return Post.findOne(query).select(fields).lean().exec();
};

dbHelper.deletePost = function (query) {
    return Post.find(query).remove().exec();
};

dbHelper.createPost = function (user, post) {
    var newPost = new Post();
    newPost.author = {_id: user._id, username: user.username};
    newPost.title = post.title;
    newPost.subtitle = post.subtitle;
    newPost.content = post.content;
    newPost.validated = !!user.admin;
    if(newPost.validated)
        newPost.validationDate = Date.now();
    if(post._id)
        newPost._id = post._id;
    return Post.update({_id: newPost._id}, newPost, {upsert: true, setDefaultsOnInsert: true}).exec();
};

module.exports = dbHelper;