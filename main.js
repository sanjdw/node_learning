/*阻塞实例*/
/*
var fs = require("fs");

var data = fs.readFileSync('README.md');

console.log(data.toString());
console.log("程序执行结束！");*/

/*非阻塞
var fs =require("js");

fs.readFile('README.md',funtion(err,data){
    if(err)
        return console.error(err);
        console.log(data.toString());
});

console.log("程序执行结束!");
 */

var eventEmitter = require("events").EventEmitter;
var event = new eventEmitter();
event.on("some_event",function () {
    console.log("some_event 事件触发！");
});
setTimeout(function () {
    event.emit("some_event");
},1000)

console.log(__filename);

process.on('exit', function(code) {

  // 以下代码永远不会执行
  setTimeout(function() {
    console.log("该代码不会执行");
  }, 0);

  console.log('退出码为:', code);
});
console.log("程序执行结束");
process.argv.forEach(function(val, index, array) {
   console.log(index + ': ' + val);
});
var util = require('util');
function Person() {
	this.name = 'byvoid';
	this.toString = function() {
	return this.name;
	};
}
var obj = new Person();
console.log(util.inspect(obj));
console.log(util.inspect(obj, true,"red"));

var http = require('http');
var url = require('url');

var http = require('http');
var querystring = require('querystring');

var postHTML =
  '<html><head><meta charset="utf-8"><title>菜鸟教程 Node.js 实例</title></head>' +
  '<body>' +
  '<form method="post">' +
  '网站名： <input name="name"><br>' +
  '网站 URL： <input name="url"><br>' +
  '<input type="submit">' +
  '</form>' +
  '</body></html>';

http.createServer(function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    // 解析参数
    body = querystring.parse(body);
    // 设置响应头部信息及编码
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});

    //if(body.name && body.url) { // 输出提交的数据
        res.write("网站名：" + body.name);
        res.write("<br>");
        res.write("网站 URL：" + body.url);
    //} else {  // 输出表单
      //  res.write(postHTML);
    //}/
    res.end();
  });
}).listen(3000);