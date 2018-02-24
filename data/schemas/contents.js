//Content用于储存文章信息
//定义Content结构

var mongoose = require('mongoose');

module.exports = new mongoose.Schema({

    //文章标题
    title: String,

    //文章简介
    description: {
        type: String,
        default: ''
    },

    //文章内容
    content: {
        type: String,
        default: ''
    },

    //category关联
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },

    //添加时间
    addTime: {
        type: Date,
        default: new Date()
    },

    //阅读量
    views: {
        type: Number,
        default: 0
    },

    //评论
    comments: {
        type: Array,
        default: []
    }

});