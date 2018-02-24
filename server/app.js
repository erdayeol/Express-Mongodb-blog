//服务器端入口

//模块加载
var express = require('express');
var mongoose = require('mongoose');
var swig = require('swig');
var bodyParser = require('body-parser');
var Cookies = require('cookies');

//引入User数据模型
var User = require('../data/models/User');

//创建服务器
var app = express();

//配置swig动态模板引擎
app.engine('html', swig.renderFile);
app.set('views', '../views');
app.set('view engine', 'html');
swig.setDefaults({cache: false});

//设置静态文件
app.use('/public', express.static(__dirname + '/../public'));

//使用body-parser中间件
app.use(bodyParser.urlencoded({extended: true}));

//利用Cookies进行管理员身份验证，且所有页面都需验证
app.use(function (req, res, next) {
    req.cookies = new Cookies(req, res);
    req.userInfo = {};
    if (req.cookies.get('userInfo')) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            User.findById(req.userInfo._id).then(function (userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        } catch (e) {
            next();
        }
    } else {
        next();
    }
});

//引入路由
app.use('/', require('./routers/main'));
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));

//mongodb数据库连接
mongoose.connect('mongodb://localhost:27017/blog', function (err) {
    if (err) {
        console.log('数据库连接失败');
    } else {
        console.log('数据库连接成功');
        app.listen(3000);
    }
});
