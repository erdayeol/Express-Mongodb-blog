//评论提交与显示

//用于储存评论信息
var comments = [];

//评论页初始页码
var page = 1;

//评论内容显示函数
function showComment() {
    //每页评论数限制
    var limit = 10;

    //评论总条数
    var count = comments.length;
    $('#messageCount').html(count);

    //评论总页数
    var pages = Math.max(Math.ceil(count / limit), 1);
    //评论显示起止项
    var start = Math.max(0, (page-1) * limit);
    var end = Math.min(start + limit, count);

    //显示评论
    if (count == 0) {
        $('.messageList').html('<div class="messageBox"><p>当前还没有评论哦！</p></div>');
    } else {
        var html = '';
        for (var i=start; i<end; i++) {
            html += '<div class="messageBox"><p class="name clear"><span class="fl">'+comments[i].username+'</span><span class="fr">'+ formatDate(comments[i].postTime) +'</span></p><p>'+comments[i].content+'</p></div>';
        }
        $('.messageList').html(html);
    }

    //评论页码控制
    var $lis = $('.pager li');
    $lis.eq(1).html( page + ' / ' +  pages);

    if (page <= 1) {
        page = 1;
        $lis.eq(0).html('<span>第一页</span>');
    } else {
        $lis.eq(0).html('<a href="javascript:;">上一页</a>');
    }

    if (page >= pages) {
        page = pages;
        $lis.eq(2).html('<span>最后一页</span>');
    } else {
        $lis.eq(2).html('<a href="javascript:;">下一页</a>');
    }
    console.log(page);
}

//评论时间格式化函数
function formatDate(date) {
    var date1 = new Date(date);
    return date1.getFullYear() + '年' + (date1.getMonth()+1) + '月' + date1.getDate() + '日 ' + date1.getHours() + ':' + date1.getMinutes() + ':' + date1.getSeconds();
}

//获取该篇文章评论并显示
$.ajax({
    type: 'GET',
    url: '/api/comment',
    data: {
        contentid: $('#contentId').val()
    },
    success: function(responseData) {
        comments =responseData.data.reverse();
        showComment();
    }
});

//提交评论
$('#messageBtn').on('click', function() {
    $.ajax({
        type: 'POST',
        url: '/api/comment/post',
        data: {
            contentid: $('#contentId').val(),
            content: $('#messageContent').val()
        },
        success: function(responseData) {
            $('#messageContent').val('');
            comments = responseData.data.comments.reverse();
            showComment();
        }
    })
});

//评论页控制
$('.pager').delegate('a', 'click', function() {
    if ($(this).parent().hasClass('previous')) {
        page--;
    } else {
        page++;
    }
    showComment();
});
