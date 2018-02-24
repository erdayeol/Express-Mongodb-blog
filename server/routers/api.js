//API接口路由

var express = require('express');
var User = require('../../data/models/User');
var Content = require('../../data/models/Content');

var router = express.Router();


//返回对象
var responseData = {};
router.use( function(req, res, next) {
    responseData = {
        code: 0,
        message: ''
    }
    next();
} );


//用户登录
router.post('/user/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    //登录验证：用户名和密码是否为空
    if ( username == '' || password == '' ) {
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空';
        res.json(responseData);
        return;
    }

    //登录验证：用户名和密码是否正确
    User.findOne({
        username: username,
        password: password
    }).then(function(userInfo) {
        if (!userInfo) {
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        //登陆成功
        responseData.message = '登录成功';
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        };
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));
        res.json(responseData);
        return;
    })

});


//用户注册
router.post('/user/register', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    //注册验证：用户名是否为空
    if ( username == '' ) {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }

    //注册验证:密码是否为空
    if (password == '') {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }

    //注册验证：两次输入的密码是否一致
    if (password != repassword) {
        responseData.code = 3;
        responseData.message = '两次输入的密码必须一致';
        res.json(responseData);
        return;
    }

    //注册验证：该用户名是否已被注册
    User.findOne({
        username: username
    }).then(function( userInfo ) {
        if ( userInfo ) {
            responseData.code = 4;
            responseData.message = '该用户名已被注册';
            res.json(responseData);
            return;
        }
        //注册成功
        var user = new User({
            username: username,
            password: password
        });
        return user.save();
    }).then(function(newUserInfo) {
        responseData.message = '注册成功';
        res.json(responseData);
    });
});


//退出登录
router.get('/user/logout', function(req, res) {
    req.cookies.set('userInfo', null);
    res.json(responseData);
});


//获取指定id文章的所有评论
router.get('/comment', function(req, res) {
    //文章id
    var contentId = req.query.contentid || '';
    //获取该文章所有评论，并返回给前端
    Content.findOne({
        _id: contentId
    }).then(function(content) {
        responseData.data = content.comments;
        res.json(responseData);
    })
});


//提交评论
router.post('/comment/post', function(req, res) {

    //文章id
    var contentId = req.body.contentid || '';
    //用户评论信息
    var postData = {
        username: req.userInfo.username,
        content: req.body.content,
        postTime: new Date()
    };
    //数据库中查询该文章评论信息并更新，然后返回给前端
    Content.findOne({
        _id: contentId
    }).then(function(content) {
        content.comments.push(postData);
        return content.save();
    }).then(function(content) {
        responseData.message = '评论成功';
        responseData.data = content;
        res.json(responseData);
    });
});


module.exports = router;