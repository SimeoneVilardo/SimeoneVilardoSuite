var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    author: {_id: Schema.Types.ObjectId, username: String},
    title: String,
    content: String,
    creationDate: { type: Date, default: Date.now }
});

var user = mongoose.model('user', postSchema);
module.exports = user;