var monggoose = require("mongoose");

var BlogSchema = new monggoose.Schema({
    title:String,
    tag:String,//标签
    content:String,//还有其他合适的数据类型吗？
    comments:[{
        name:String,
        time:Date,
        content:String
    }],
    pv:Number,//访问次数
    meta:{
        date_time:{
            type:Date,
            default:Date.now()
        },
        last_modified_time:{
            type:Date,
            default:Date.now()
        }
    }
});

BlogSchema.pre('save',function(callback){
    if(this.isNew){
        this.meta.date_time = this.meta.last_modified_time = Date.now()
    }else{
        this.meta.last_modified_time = Date.now()
    }
    callback();
})
//模型的静态方法
BlogSchema.statics = {
    first:function (cb) {
        return this
            .findOne({})
            .exec(cb)
    },
    fetch:function(cb){
        return this
            .find({})
            .sort({'meta.date_time':-1})    //  sort('-meta.date_time')
            .exec(cb)
    },
    findById:function(id,cb){
        return this
            .findOne({_id:id})
            .exec(cb)
    },
    findByTag:function(tag,cb){
        return this
            .find({tag:tag})
            .exec(cb)
    }
};

module.exports = BlogSchema;