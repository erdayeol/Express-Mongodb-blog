//前台路由管理

var express = require('express');
var Category = require('../../data/models/Category');
var Content = require('../../data/models/Content');

var router = express.Router();

//data对象用于储存路由数据，并传递给动态网页模板
var data = {};


//用户信息和文章分类信息处理
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
    }

    Category.find().then(function (categories) {
        data.categories = categories;
        next();
    });
});


//首页内容处理
router.get('/', function (req, res, next) {
    //文章分类id
    data.category = req.query.category || '';

    //pageCategory对象储存请求页分类信息，用于数据查找
    var pageCategory = {};
    if (data.category) {
        pageCategory.category = data.category
    }

    //文章列表分页处理
    Content.where(pageCategory).count().then(function (count) {
        //文章总数
        data.count = count;
        //每页文章数限值
        var limit = 6;
        //文章列表总页数
        data.pages = Math.max(Math.ceil(data.count / limit), 1);
        //当前页码最大为总页码数，最小为1
        data.page = Math.min(Number(req.query.page || 1), data.pages);
        data.page = Math.max(data.page, 1);
        //跳过项
        var skip = (data.page - 1) * limit;
        //查找当前页显示项
        Content.where(pageCategory).find().limit(limit).skip(skip).populate('category').sort({addTime: -1}).then(function (contents) {
            data.contents = contents;
            res.render('main/index', data);
        });
    });
});


//文章详情页内容处理
router.get('/view', function (req, res) {
    //请求文章的_id
    var contentId = req.query.contentid || '';

    Content.findOne({
        _id: contentId
    }).then(function (content) {
        content.views++;
        content.save();
        data.content = content;
        res.render('main/view', data);
    });

});

module.exports = router;