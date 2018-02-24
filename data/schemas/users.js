//User用于储存用户信息
//定义User结构

var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    //用户名
    username: String,
    //密码
    password: String,
    //管理员身份
    isAdmin: {
        type: Boolean,
        default: false
    }

});