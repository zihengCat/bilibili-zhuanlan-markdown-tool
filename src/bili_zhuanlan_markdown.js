/*
 * bilibili Zhuanlan Markdown Supporter
 * Author: zihengCat
 * Lincese: MIT
 */
const fs = require('fs');
const path = require('path');
const url = require('url');
const http = require('http');
const https = require('https');
const querystring = require('querystring');
const marked = require('marked');
var biliZhuanLanMarkdown = {
    /* 专栏表单数据结构 */
    formdata_template: {
        "title": "",       /* 自动获取 */
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
        "aid": 0,          /* 必需 */
        "csrf": ""		   /* 自动获取 */
    },
    /* Markdown 文本 */
    markdown_text: "",
    /* 转换后 HTML 文本 */
    html_text: "",
    /* Markdown 文档路径 */
    markdown_path: "",
    /* 配置选项 */
    preference_form: { },
    /* 本地图片地址暂存区 */
    image_local_urls: [ ],
    /* 上传图片地址暂存区 */
    image_bili_urls: [ ],
    /* 核心函数: Markdown 转 HTML */
    md2Html: function (markdown_str) {
        /* 自定义生成器 */
        var myRenderer = new marked.Renderer();
        /* 覆写`标题`生成规则 */
        myRenderer.heading = function (text, level) {
            return '<h' + level + '>' + text +
                   '</h' + level + '>';
        }
        /* 覆写`图片`生成规则 */
        myRenderer.image = function (href, title, text) {
            return '<figure class="img-box">' +
                   '<img src="%src" />'.replace("%src", href) +
                   '<figcaption class="caption">%t</figcaption>'.replace("%t", text) +
                   '</figure>';
        }
        /* 覆写`删除线`生成规则 */
        myRenderer.del = function (text) {
            return '<span style="text-decoration: line-through;">' + text +
                   '</span>';
        }
        /* 禁用内联 HTML 功能 */
        marked.setOptions({
            renderer: myRenderer,
            sanitize: false,
            headerIds: false
        });
        this.html_text = marked(markdown_str);
        return this.html_text;
    },
    /* 核心函数: 文本计数 */
    wordsCount: function (html_str) {
        /* 去除HTML tags */
        html_str = html_str.replace(/<\/?[^>]*>/g, '');
        /* 去除行尾空白 */
        html_str = html_str.replace(/[ | ]*\n/g, '');
        /* 去除多余空白行 */
        html_str = html_str.replace(/\n[\s| | ]*\r/g, '');
        /* 去除所有空格符 */
        html_str = html_str.replace(/ /ig, '');
        /* 去除所有换行符 */
        html_str = html_str.replace(/\n/g, '');
        html_str = html_str.replace(/\r\n/g, '');
        return html_str.length;
    },
    /* 核心函数: 获取小结 */
    getSummary: function (html_str) {
        /* 去除HTML tags */
        summary_str = html_str.replace(/<\/?[^>]*>/g, '');
        /* 取前100字符 */
        return summary_str.slice(0, 100);
    },
    /* HTML发送表单 */
    htmlFormGenerate: function (str, pform) {
        /* 深拷贝模版数据 */
        var form_data = { };
        for(var key in this.formdata_template) {
            form_data[key] = this.formdata_template[key];
        }
        /* 加入用户配置数据 */
        var title_str = path.basename(this.markdown_path);
        title_str = title_str.slice(0, title_str.lastIndexOf('.'));
        form_data["title"] = title_str;
        // form_data["tid"]   = pform["tid"];
        form_data["aid"]   = pform["aid"];
        form_data["csrf"]  = pform["csrf"];
        /* 覆写目标数据 */
        form_data["content"] = this.html_text;
        form_data["words"]   = this.wordsCount(this.html_text);
        form_data["summary"] = this.getSummary(this.html_text);
        return form_data;
    },
    /* 生成图片发送表单 */
    imagesFormGenerate: function(img_url, csrf=this.preference_form["csrf"]) {
        /* 图片转 Base64 编码 */
        function img_to_Base64(img_src) {
        /*  图片 Base64 格式头 */
        /*  png  -> data:image/png;base64,
            jpeg -> data:image/jpeg;base64,
            gif  -> data:image/gif;base64,  */
            if(img_src.indexOf('http') != 0) {
                var img_prefix = "";
                var img_data = fs.readFileSync(img_src);
                var img_Base64 = img_data.toString('base64');
                if(path.extname(img_src) == '.png') {
                    img_prefix = "data:image/png;base64,";
                }
                else if(path.extname(img_src) == '.jpg' ||
                        path.extname(img_src) == '.jpeg')
                {
                    img_prefix = "data:image/jpeg;base64,";
                }
                else if(path.extname(img_src) == '.gif') {
                    img_prefix = "data:image/gif;base64,";
                }
                return img_prefix + img_Base64;
            }
        }
        /* 构建图片上传表单返回 */
        var img_post_form = {
            "cover": img_to_Base64(img_url),
            "csrf": csrf
        };
        return img_post_form;
    },
    /* 入口函数 */
    startProcess: function (md_path, p_form) {
        /* 读取 MD 文档与配置信息 */
        this.markdown_path = path.resolve(md_path);
        this.markdown_text = fs.readFileSync(md_path, 'utf-8');
        this.preference_form = p_form;
        /* 转换Markdown文档至HTML */
        this.md2Html(this.markdown_text);
        /* 处理图片 */
        this.processAll();
        /* 发送表单 */
        this.postHtmlForm();
    },
    processAll: function () {
        this.processLocalImages();
    },
    /* 处理HTML中的本地图片 */
    processLocalImages: function () {
        function checkLocally(src) {
            if(src.indexOf("http") == 0) {
                return false;
            }
            else {
                return true;
            }
        }
        /* 获取所有图片地址
           格式: <img src="%src" /> */
        var all = this.html_text.match(/src=.* \/>/g);
        /* 如果不存在图片, 直接返回(优化) */
        if(all == null) {
            return;
        }
        /* 找到所有本地图片 */
        for(var i = 0; i < all.length; i++) {
            var origin = all[i].slice(all[i].indexOf('"') + 1,
                                      all[i].lastIndexOf('"'));
            /* 使用图片绝对路径 */
            var abs_path = path.resolve(path.dirname(this.markdown_path),
                                        origin);
            if(checkLocally(origin) == true) {
                /* 生成图片上传表单 */
                var img_form = this.imagesFormGenerate(abs_path);
                /* 取图片特征值作图片ID */
                var img_id = img_form["cover"].slice(-50, -30);
                /* 图片地址存入本地图片暂存区 */
                this.image_local_urls.push([ img_id, origin ]);
                /* 上传图片至B站服务器 */
                this.postRequest(img_form, "image");
            }
        }
    },
    /* 将HTML中的本地图片地址替换为B站图片地址 */
    repalceLocalImgURLs: function (fmt_str) {
        /* 根据格式字符串取得目标信息 */
        var arr = fmt_str.split(",");
        var img_id = arr[0];
        var img_bili_url = arr[1];
        var img_local_url = "";
        /* 根据图片ID匹配本地图片地址 */
        for(var i = 0; i < this.image_local_urls.length; i++) {
            if(this.image_local_urls[i][0] == img_id) {
                img_local_url = this.image_local_urls[i][1];
            }
        }
        /* 替换本地图片地址
           格式: src="./bilibili.png" */
        this.html_text =
        this.html_text.replace(new RegExp(img_local_url, "g"), img_bili_url);
    },
    /* 提交 HTML 表单 */
    postHtmlForm: function () {
        this.postRequest(this.htmlFormGenerate(this.markdown_text, this.preference_form), "html");
    },
    /* 核心函数: 提交表单数据 */
    postRequest: function (form_data, flag_str) {
        /* 公共头部 */
        var post_option = {
        method: 'POST',
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
            'Referer': 'https://member.bilibili.com/article-text/home?aid=' +
                        this.preference_form['aid'],
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
            /* 构建 Cookie */
            'Cookie': this.preference_form["cookies"]
            }
        }
        if(flag_str == "image") {
            /* 图片提交头 */
            post_option.host = 'member.bilibili.com'
            post_option.path = '/x/web/article/upcover';
            post_option.headers['X-Requested-With'] = 'XMLHttpRequest';
/*------------------*/
/* Promise 同步执行 */
new Promise(function(resolve, reject) {
    var body = [ ];
    var img_id = form_data["cover"].slice(-50, -30);
    var req = http.request(post_option, function(res) {
        //console.log("StatusCode: ", res.statusCode);
        //console.log("Headers: ", JSON.stringify(res.headers));
        res.setEncoding('utf-8');
        res.on('data', function(chunk) {
            //console.log("Body: \n" + chunk);
            /* 获取返回JSON */
            body.push(chunk);
        });
        res.on('end', function(chunk) {
            body = JSON.parse(body.toString());
            if(body.data.url != undefined) {
                /* 返回格式化字符串 */
                resolve(img_id + "," + body.data.url);
            }
        });
    });
    req.on('error', function(e){
        console.log("Error: " + e.message);
    });
    req.write(querystring.stringify(form_data));
    req.end();
}).then(function (result){
    /* 可优化部分 */
    biliZhuanLanMarkdown.repalceLocalImgURLs(result);
    biliZhuanLanMarkdown.postHtmlForm();
});
/*------------------*/
        }
        else if (flag_str == "html") {
            /* HTML 提交头 */
            post_option.host = 'api.bilibili.com'
            post_option.path = '/x/article/creative/draft/addupdate';
            /* 发送HTML表单 */
            var req = http.request(post_option, function(res) {
                console.log("StatusCode: ", res.statusCode);
                //console.log("Headers: ", JSON.stringify(res.headers));
                res.setEncoding('utf-8');
                res.on('data', function(chunk) {
                    console.log("Data: " + chunk);
                });
                res.on('end', function(chunk) {
                    //console.log("Status: Successful!");
                });
            });
            req.on('error', function(e){
                console.log("Error: " + e.message);
            });
            /* 序列化表单数据 */
            req.write(querystring.stringify(form_data));
            req.end();
        }
    }
}
module.exports = biliZhuanLanMarkdown;
