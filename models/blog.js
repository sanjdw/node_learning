var mongoose = require('mongoose');
var BlogSchema = require('../schemas/blog');
var Blog = mongoose.model('Blog',BlogSchema);

module.exports = Blog;