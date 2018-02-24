//CategorY用于储存文章分类信息
//定义category结构

var mongoose = require('mongoose');

module.exports = new mongoose.Schema({

    //分类名称
    name: String

});