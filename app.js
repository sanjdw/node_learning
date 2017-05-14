var express = require('express');
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var _ = require('underscore');
var Blog = require('./models/blog');
var User = require('./models/user');
var path = require('path');
var bodyParser = require('body-parser');
var markdown = require( "markdown" ).markdown;; // markdown模块

var app = express();
mongoose.Promise = global.Promise;//因为报这个提示：Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead
                                    //mongoose 不再内置实现promise了 需要添加第三方promise插件
mongoose.connect('mongodb://localhost/blog');      //链接数据库,端口默认为27017

app.use(express.static(path.join(__dirname,'public')));       //静态文件路径，__dirname: 开发期间代码所在目录
app.set('views',path.join(__dirname,'views/pages'));        //渲染的模板路径，path.join(): 合并路径得到一个标准化路径字符串
app.set('view engine','jade');      //模板引擎  jade?ejs?前端路由?
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.locals.moment = require('moment');
 

app.listen(port);

console.log('project has started on port port 3000!');

app.get('/',function(req,res){
    Blog.first(function (err,blog) {
        if(err){
            console.log(err)
        }
        res.render('blog_index',{
            title:'Grain',
            blog:blog
        });
    });
});

app.post('/user/signup',function(req, res){
    var _user = req.body.user;
    console.log(_user);
});
app.get('/read/:id',function(req,res){
    var id = req.params.id;

    Blog.findById(id,function(err,blog){
        res.render('read',{
            title:blog.title,
            blog:blog
        });
    });
});
//目录
app.get('/catalog',function (req,res) {
    Blog.fetch(function (err,blogs) {
        if(err){
            console.log("找不到文章!");
            return ;
        }
        res.render('catalog',{
            title:'归档',
            blogs:blogs
        })
    });
});
//标签
app.get('/category/:tag',function (req,res) {
    var tag = req.params.tag;

    Blog.findByTag(tag,function (err,blogs) {
        if(err){
            console.log(err);
            return;
        }
        res.render('category',{
            title:tag,
            blogs:blogs,
            num:blogs.length
        })
    })
});
app.get('/admin/add_blog',function(req,res){
    res.render('add_blog',{
        title:'添加博客',
        blog:{
            title:'',
            tag:'',
            content:''
        }
    })
});


//编辑页
app.get('/admin/update/:id',function(req,res){
    var id = req.params.id;

    if(id){
        Blog.findById(id,function(err,blog){
            res.render('add_blog',{
                title:'编辑博客',
                blog:blog
            })
        })
    }
})

//点击保存
app.post('/admin/blog/new',function(req,res){
    var id = req.body.blog._id;
    var blogObj = req.body.blog;
    var _blog;
    if(id !== 'undefined'){//该电影已经存储过,这里加分号
        Blog.findById(id,function(err,blog){
            if(err){
                console.log(err);
            }

            _blog = _.extend(blog,blogObj); // underscore
            _blog.save(function(err,blog){
                if(err){
                    console.log(err);
                }
                res.redirect('/read/' + blog._id);
            });
        });
    }else{
        _blog= new Blog({
            title:blogObj.title,
            tag:blogObj.tag,
            content:blogObj.content
        });
        _blog.save(function(err,blog){
            if(err){
                console.log(err);
            }
            res.redirect('/read/' + _blog._id);
        });
    }
})


app.get('/admin',function(req,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log(err);
        }
        res.render('blog_list',{
            title:'博客列表',
            blogs:blogs
        });
    })

});


app.delete('/admin/list',function(req,res){
    var id = req.query.id;
    if(id){
        Blog.remove({_id:id},function(err,blog){
            if(err){
                console.log(err);
            }else{
                res.json({success:1})
            }
        })
    }
})


app.get('/admin/login',function(req,res){
    res.render('login',{
        title:'后台登录'
    });
})