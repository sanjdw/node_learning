var server = require('./server');   //nodejs文件名默认后缀名为js
var router = require('./router');

server.start(router.route);