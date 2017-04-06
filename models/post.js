var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    author: {_id: { type: Schema.Types.ObjectId, required: true}, username: { type: String, required: true}},
    title: { type: String, required: true},
    subtitle: { type: String, required: true},
    content: { type: String, required: true},
    validated: {type: Boolean, default: false, required: true},
    validationDate: { type: Date },
    creationDate: { type: Date, default: Date.now }
});

var post = mongoose.model('post', postSchema);
module.exports = post;