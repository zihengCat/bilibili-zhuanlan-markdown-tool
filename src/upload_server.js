/*
 * bilibili Zhuanlan Markdown Tool - UpLoader Front-end
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const biliZhuanlanMarkdown = require('./bili_zhuanlan_markdown.js');
/* 创建 HTTP 服务器 */
http.createServer(function (request, response) {
    /* 读取前端 HTML 页面 */
    var html_full_path = path.resolve(__dirname, '../front_end/index.html');
    var html_data = fs.readFileSync(html_full_path, 'utf-8');
    /* 读取提交表单 */
    var body = "";
    request.on('data', function(chunk) {
        body += chunk;
    });
    request.on('end', function(chunk) {
        body = querystring.parse(body);
        response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        /* 核对信息无误 */
        if(body.md_file_path && body.config_check == "ok") {
            /* 读取配置文件 */
            var abs_cfg_path = path.resolve(__dirname,
                               '../config/config.json');
            var cfg = fs.readFileSync(abs_cfg_path, 'utf-8');
            /* 调用接口上传处理 */
            biliZhuanlanMarkdown.startProcess(body.md_file_path,
                                              JSON.parse(cfg));
            /* 返回成功页面 */
            var html_success_path = path.resolve(__dirname,
                                    '../front_end/feedback_success.html');
            var html_success_data = fs.readFileSync(html_success_path, 'utf-8');
            response.write(html_success_data);
            }
        else {
            /* 返回同页面 */
            response.write(html_data);
        }
        response.end();
    });
}).listen(8888);
/* 终端打印信息 */
console.log('Server running at http://127.0.0.1:8888/');
