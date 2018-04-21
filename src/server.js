var http = require('http');
var fs = require('fs');
var querystring = require('querystring');

http.createServer(function (request, response) {
    var html_data = fs.readFileSync('./index.html', 'utf-8');
    var body = "";
    request.on('data', function(chunk) {
        body += chunk;
    });
    request.on('end', function(chunk) {
        body = querystring.parse(body);
        // 发送 HTTP 头部
        // HTTP 状态值: 200 : OK
        // 内容类型: text/plain
        response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        // 发送响应数据
        if(body.title) {
            response.write("Title: " + body.title);
            response.write("Aid: " + body.aid);
            response.write("Tid: " + body.tid);
            response.write("Cookies: " + body.cookies);
        } else {
            response.write(html_data);
        }
        response.end();
    });
}).listen(8888);

// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');

