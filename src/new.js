/*
 * bilibili Zhuanlan Markdown Tool - New Poster
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
const fs = require('fs');
const path = require('path');
const url = require('url');
const http = require('http');
const https = require('https');
const querystring = require('querystring');
/*------------------*/
/* Promise 执行 */
new Promise(function(resolve, reject) {
    var get_csrf = function (cookies_str) {
        cookies_str = cookies_str.split(';');
        for(var i = 0; i < cookies_str.length; i++) {
            cookies_str[i] = cookies_str[i].trim();
        }
        var csrf = "";
        for(var i = 0; i < cookies_str.length; i++) {
            /* 字段: `bili_jct` */
            if(cookies_str[i].indexOf("bili_jct=") == 0) {
                csrf = cookies_str[i].slice(cookies_str[i].indexOf("=") + 1);
            }
        }
        return csrf;
    }
    /* 分离命令行参数 */
    var args = process.argv.splice(2);
    var title = "";
    if(args.length == 1) {
        title = args[0];
    } else {
        title = "New_Post";
    }
    var abs_cfg_path = path.resolve(__dirname, '../config/config.json');
    //console.log(abs_cfg_path);
    var pform = fs.readFileSync(abs_cfg_path, 'utf-8');
    pform = JSON.parse(pform);
    pform["csrf"] = get_csrf(pform['cookies']);
    var form_data = {
            "title": title,
            "banner_url": "",
            "content": "",     /* 自动生成 */
            "summary": "",     /* 自动生成 */
            "words": 0,        /* 自动生成 */
            "category": 0,
            "list_id": 0,
            "tid": 0,          /* 不明 */
            "reprint": 0,      /* 必需 */
            "tags": "",
            "image_urls": "",
            "origin_image_urls": "",
            "dynamic_intro": "",
            // "aid": "",         /* 不需要 */
            "csrf": pform['csrf']
    };
    /* 公共头部 */
    var post_option = {
        method: 'POST',
        /* HTML 提交头 */
        host: 'api.bilibili.com',
        path: '/x/article/creative/draft/addupdate',
        headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            /* 计算文档长度 */
            'Content-Length': Buffer.byteLength(querystring.stringify(form_data)),
            'DNT': '1',
            'Origin': 'https://member.bilibili.com',
            /* 构建 Referer 头 */
            'Referer': 'https://member.bilibili.com/article-text/home' + '?',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
            /* 构建 Cookie */
            'Cookie': pform['cookies']
        }
    };
    var body = [ ];
    var req = http.request(post_option, function(res) {
        //console.log("StatusCode: ", res.statusCode);
        //console.log("Headers: ", JSON.stringify(res.headers));
        res.setEncoding('utf-8');
        res.on('data', function(chunk) {
            /* 获取返回JSON */
            body.push(chunk);
        });
        res.on('end', function(chunk) {
            body = JSON.parse(body.toString());
            if(body.data.aid != undefined) {
                /* 返回格式化字符串 */
                pform['aid'] = body.data.aid;
                resolve(pform);
            }
        });
    });
    req.on('error', function(e){
        console.log("Error: " + e.message);
    });
    req.write(querystring.stringify(form_data));
    req.end();
}).then(function (result){
    var abs_cfg_full_path = path.resolve(__dirname, '../config/config_full.json');
    fs.writeFileSync(abs_cfg_full_path, JSON.stringify(result));
    console.log("Success [aid=" + result["aid"] + ']');
});
