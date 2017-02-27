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