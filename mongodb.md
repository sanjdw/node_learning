## MongoDB
MongoDB是一个开源的NoSQL数据库，同时也是一个对象数据库，没有了表，行等概念，所有数据以文档形式存储，数据格式就是JSON。

在 mongodb 中，表与表之间是没有联系的，不像 sql 中一样，可以设定外键，可以进行表连接。mongodb 中，也无法支持事务。

>MongoDB (from "humongous") is an open-source document database, and the leading NoSQL database. Written in C++

在 sql 中，我们的数据层级是：数据库（db） -> 表（table） -> 记录（record）-> 字段；在 mongodb 中，数据的层级是：数据库 -> collection -> document -> 字段。

`文档`两个字很容易误解。这个文档是`bson`的意思，json 的超集，比如 json 中没法储存二进制类型，而 bson 拓展了类型，提供了二进制支持。mongodb 中存储的一条条记录都可以用 bson 来表示。所以可以认为，mongodb 是个存 bson 数据的数据库，或是存哈希数据的数据库。

### Mongoose
Mongoose是MongoDB的一个对象模型工具，封装了MongoDB对文档的一些增删改查的方法，使得操作MongoDB变得更简单。

### Schema
Schema是一种以文件形式存储的数据库模型骨架，不具备操作数据库的能力，只是定义数据库模型在程序片段中的一种表现。

定义Schemal：

    var mongoose = require('mongoose');
    UserSchema = new mongoose.Schema({
                      username: {
                        type: String,
                        required: true
                      },
                      password: {
                        type: String,
                        required: true
                      }
                    });
    var UserModel = mongoose.model('User',UserSchema);
    module.exports = UserSchema;//暴露接口

### 模型Model
由Schema构造生成的模型，具有数据库操作的行为，类似于管理数据库属性、行为的类。

通过Schema来创建Mode：

    定义Model     //模型名User,对应MongoDB数据库中集合名称user
    var UserModel = mongoose.model('User', UserSchema);
    //拿到了Model，我们就拥有了操作数据库的钥匙。

### 实体Entity
由Model创建的实体，使用save方法保存数据，Model和Entity都有能影响数据库的操作。

使用Model创建实体：

    var user = new User({
        username:'yugu',
        password:'123456'
    })

### CRDU--Create、Retrieve、update、Delete
增：

    //Entity的save方法
    new User({
        username:'yugu',
        password:'123456'
    }).save(function(err){
        //***
    });
    //Model的create方法
    User.create({
        username:'yugu',
        password:'123456
    },function(err,obj){
        //
    })
读：

    User.find({
        //查询条件，以key:value形式
    },function(err,list){
        //查询成功结果返回的是一个对象数组，好比Django中的filter
    });

    User.findOne({
        'username':'yugu'
    },function(err,obj){
        //findOne好比Django查询中的get，查询结果返回一个对象
    });
更新：

    //拿到Entity直接赋值：
    User.findOne({
        //
    },function(err,obj){
        obj.username = "newName";
        obj.save(function(err){
            //**
        })
    })

    //通过Model的update方法：这是比较麻烦的方法，还是用save或者后面的方法吧
    User.findOne({
        //
    },function(err,obj){
        var _id = obj._id;
        delete obj._id;//update不能更新主键，所以要将主键删除
        User.update({id:_id},obj,function(err){
            //***update的第一个参数是查询条件，第二个是更新对象
        });
    })

    //通过Model的findByIdAndupdate、findOneAndUpdate方法：
    User.findByIdAndUpdate(1, {
        username: 'newName',//新的属性及value
    }, function(err,obj) {
        //**
    });

    User.findByIdAndUpdate({
        username:'yugu'
    }, {
        username: 'newName',//新的属性及value
    }, function(err,obj) {
        //**
    });
删除：

    //Model的remove方法
    User.remove({
        username:'yugu'
    },function(err,list){
        //**
    })
