//管理员页面路由管理

var express = require('express');

var router = express.Router();

var User = require('../../data/models/User');
var Category = require('../../data/models/Category');
var Content = require('../../data/models/Content');

//data对象用于储存路由数据，并传递给动态网页模板
var data = {};


//管理员身份验证
router.use(function(req, res, next) {
    if (!req.userInfo.isAdmin) {
        res.send('抱歉，只有管理员才能进入后台管理');
        return;
    }

    data = {
        userInfo: req.userInfo,
    }
    next();
});


//后台管理首页处理
router.get('/', function(req, res, next) {
    res.render('admin/index', data);
});


//用户管理页处理
router.get('/user', function(req, res) {
    User.count().then(function(count) {
        //数据总条数
        data.count = count;
        //每页数据条数限值
        var limit = 8;
        //总页数
        data.pages = Math.max(Math.ceil(data.count / limit),1);
        //当前页码最大为总页码数，最小为1
        data.page = Math.min(Number(req.query.page || 1), data.pages );
        data.page = Math.max(data.page, 1 );
        //跳过项
        var skip = (data.page - 1) * limit;
        //查找当前显示项
        User.find().limit(limit).skip(skip).then(function(users) {
            data.users = users;
            res.render('admin/user/user_index', data)
        });
    });
});


//分类管理-分类首页处理
router.get('/category', function(req, res) {
    Category.count().then(function(count) {
        //数据总条数
        data.count = count;
        //每页数据条数限值
        var limit = 8;
        //总页数
        data.pages = Math.max(Math.ceil(data.count / limit),1);
        //当前页码最大为总页码数，最小为1
        data.page = Math.min(Number(req.query.page || 1), data.pages );
        data.page = Math.max(data.page, 1 );
        //跳过项
        var skip = (data.page - 1) * limit;
        //查找当前显示项
        Category.find().limit(limit).skip(skip).then(function(categories) {
            data.categories = categories;
            res.render('admin/category/category_index', data)
        });
    });
});


//分类管理-分类首页-分类修改页处理
router.get('/category/edit', function(req, res) {
    //要修改分类的id
    var id = req.query.id || '';

    //获取要修改的分类信息
    Category.findOne({
        _id: id
    }).then(function(category) {
            data.category = category;
            res.render('admin/category/category_edit', data);
    });
});


//分类管理-分类首页-分类修改页-提交处理
router.post('/category/edit', function(req, res) {
    //要修改分类的id
    var id = req.query.id || '';

    //提交的分类名称
    var name = req.body.name || '';

    //修改分类信息
    Category.findOne({
        _id: id
    }).then(function(category) {
            //修改验证:没有做出修改
            if (name == category.name) {
                data.message = '修改成功';
                data.url = '/admin/category'
                res.render('admin/success', data);
                return new Promise(function(resolve, reject) {
                    console.log('未对分类名称做出修改');
                });
            } else {
                //修改验证:做出修改
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                });
            }
    }).then(function(category) {
        //修改验证：已存在同名分类
        if (category) {
            data.message = '已存在同名分类';
            res.render('admin/error', data);
            return new Promise(function(resolve, reject) {
                console.log('抱歉，已存在同名分类');
            });
        } else {
            //修改验证：未发现同名分类
            return Category.update({
                _id: id
            }, {
                name: name
            });
        }
    }).then(function() {
        //分类修改提交成功
        data.message = '修改成功';
        data.url = '/admin/category';
        res.render('admin/success', data);
    })
});


//分类管理-分类首页-分类删除处理
router.get('/category/delete', function(req, res) {
    //要删除分类的id
    var id = req.query.id || '';

    //删除分类信息
    Category.remove({
        _id: id
    }).then(function() {
        data.message = '修改成功';
        data.url = '/admin/category';
        res.render('admin/success',data);
    });
});


//分类管理-分类添加页处理
router.get('/category/add', function(req, res) {
    res.render('admin/category/category_add', data);
});

//分类管理-分类添加页-提交处理
router.post('/category/add', function(req, res) {
    //提交的分类名称
    var name = req.body.name || '';

    //添加验证：分类名称不能为空
    if (name == '') {
        data.message = '名称不能为空';
        res.render('admin/error', data);
        return;
    }

    //添加验证：是否已存在同名分类
    Category.findOne({
        name: name
    }).then(function(category) {
        if (category) {
            data.message = '抱歉，已存在同名分类';
            res.render('admin/error',data);
            return new Promise(function(resolve, reject) {
                console.log('抱歉，已存在同名分类');
            });
        } else {
            return new Category({
                name: name
            }).save();
        }
    }).then(function(newCategory) {
        //分类添加成功
        data.message = '分类添加提交成功';
        data.url = '/admin/category';
        res.render('admin/success', data);
    })
});


//文章管理-文章首页处理
router.get('/content', function(req, res) {
    Content.count().then(function(count) {
        //数据总条数
        data.count = count;
        //每页数据条数限值
        var limit = 6;
        //总页数
        data.pages = Math.max(Math.ceil(data.count / limit),1);
        //当前页码最大为总页码数，最小为1
        data.page = Math.min(Number(req.query.page || 1), data.pages );
        data.page = Math.max(data.page, 1 );
        //跳过项
        var skip = (data.page - 1) * limit;
        //查找当前显示项
        Content.find().limit(limit).skip(skip).populate('category').then(function(contents) {
            data.contents = contents;
            res.render('admin/content/content_index', data)
        });
    });
});


//文章管理-文章首页-文章修改页处理
router.get('/content/edit', function(req, res) {
    //要修改文章的id
    var id = req.query.id || '';

    //文章分类
    Category.find().sort({_id: 1}).then(function(categorys) {
        data.categories = categorys;

        //获取该文章信息
        return Content.findOne({
            _id: id
        }).populate('category');
    }).then(function(content) {
        data.content = content;
        res.render('admin/content/content_edit',data);
    });
});


//文章管理-文章首页-文章修改页-提交处理
router.post('/content/edit', function(req, res) {
    //要修改文章的id
    var id = req.query.id || '';

    //修改验证：文章标题不能为空
    if ( req.body.title == '' ) {
        data.message = '内容标题不能为空'
        res.render('admin/error', data);
        return;
    }

    //修改验证：文章分类不能为空
    if ( req.body.category == '' ) {
        data.message = '内容分类不能为空'
        res.render('admin/error', data);
        return;
    }

    //修改验证：文章简介不能为空
    if ( req.body.description == '' ) {
        data.message = '内容简介不能为空'
        res.render('admin/error', data)
        return;
    }

    //修改验证：文章内容不能为空
    if ( req.body.content == '' ) {
        data.message = '内容内容不能为空'
        res.render('admin/error', data)
        return;
    }

    //文章信息更新
    Content.update({
        _id: id
    }, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function() {
        data.message = '文章修改成功';
        data.url = '/admin/content'
        res.render('admin/success', data);
    });
});


//文章管理-文章首页-文章删除处理
router.get('/content/delete', function(req, res) {

    //要删除文章的id
    var id = req.query.id || '';
    //删除文章
    Content.remove({
        _id: id
    }).then(function() {
        data.message = '文章删除成功';
        data.url = '/admin/content'
        res.render('admin/success', data);
    });

});


//文章管理-文章添加页处理
router.get('/content/add', function(req, res) {

    Category.find().sort({_id:1}).then(function(categories) {
        data.categories = categories;
        res.render('admin/content/content_add', data)
    });

});


//文章管理-文章添加页-提交处理
router.post('/content/add', function(req, res) {

    //添加验证：文章标题不能为空
    if ( req.body.title == '' ) {
        data.message = '文章标题不能为空';
        res.render('admin/error', data);
        return;
    }

    //添加验证：文章分类不能为空
    if ( req.body.category == '' ) {
        data.message = '文章分类不能为空';
        res.render('admin/error', data);
        return;
    }

    //添加验证：文章简介不能为空
    if ( req.body.description == '' ) {
        data.message = '文章简介不能为空';
        res.render('admin/error', data);
        return;
    }

    //添加验证：文章内容不能为空
    if ( req.body.content == '' ) {
        data.message = '文章简介不能为空';
        res.render('admin/error', data);
        return;
    }

    //添加文章
    new Content({
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).save().then(function(rs) {
        data.message = '文章添加成功';
        data.url = '/admin/content';
        res.render('admin/success', data);
    });

});


module.exports = router;