/*
 * Bilibili Zhuanlan Markdown Tool - Core Class
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
'use strict';
/* Standard Libs */
const fs = require('fs');
const path = require('path');
const url = require('url');
const http = require('http');
const https = require('https');
const querystring = require('querystring');
/* Third-Part Libs */
const marked = require('marked');
/*
 * 类说明
 * 参数:  Markdown路径 => `path`, 配置选项 => `object`
 * 流程:  取得 MD 文档与配置选项 => Markdown 转换 HTML =>
 *        上传本地图片取得B站外链 => 替换本地图片地址为B站外链地址 =>
 *        合成表单发送更新
 */
class biliZhuanlanMarkdown {
    constructor(user_cfg_obj = { }) {
        /* 专栏表单数据结构 */
        this.form_template = {
            "title": "",       /* 文章标题(自动生成) */
            "banner_url": "",  /* 文章头图(可为空) */
            "content": "",     /* 文章HTML内容(自动生成) */
            "summary": "",     /* 文章小结(自动生成) */
            "words": 0,        /* 文章字数(自动生成) */
            "category": 0,     /* 文章分类 */
            "list_id": 0,      /* 文章文集(轻小说) */
            "tid": 0,          /* 不明 */
            "reprint": 1,      /* 可否复制(必需[0, 1]) */
            "tags": "",        /* 文章标签 */
            "image_urls": "",  /* 头图 */
            "origin_image_urls": "",
            "dynamic_intro": "", /* 文章推荐语(可为空) */
            "aid": "",         /* 可有可无 => 有: 修改草稿, 无: 新增草稿 */
            "csrf": ""		   /* 跨域认证(自动生成) */
        };
        /* 公共提交头 */
        this.post_option_template = {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                'Connection': 'keep-alive',
                /* 表单类型 */
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                /* 文档长度 */
                'Content-Length': '',
                   // Buffer.byteLength(querystring.stringify(form_data)),
                /* 不跟踪 */
                'DNT': '1',
                /* 来源 => B站 */
                'Origin': 'https://member.bilibili.com',
                /* 构建 Referer 头 */
                'Referer': 'https://member.bilibili.com/article-text/home?',
                    //  + 'aid=' + aid,
                /* 构建 UA 选项 */
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
                /* 构建 Cookie */
                'Cookie': '',
                    //this.user_config["cookies"]
            }
        };
        /* 用户自定义数据 */
        this.user_config = user_cfg_obj;
        /* 中间数据 */
        this.hidden_content = {
            /* Markdown 文档路径 */
            markdown_path: "",
            /* 待转换 Markdown 文本 */
            markdown_text: "",
            /* 转换后 HTML 文本 */
            html_text: "",
            /* 本地图片地址暂存区 */
            image_local_urls: [ ],
            /* 上传图片地址暂存区 */
            image_bili_urls: [ ],
            /* 跨域访问 csrf */
            csrf: ""
        };
    }
    /* API函数: 上传本地图片 */
    uploadImage(img_path) {
        if(this._check_cookies(this.user_config.cookies) === true)
        {
            this.postHTMLForm(img_path, "image");
        }
        else {
            throw("Error");
        }
    }
    /* API函数: 发送文章 */
    sendArticle(md_path) {
        if(this._check_markdown_path(md_path) === true &&
           this._check_cookies(this.user_config.cookies) === true)
        {
            /* 加入 Markdown 文档绝对路径 */
            this.hidden_content.markdown_path =
                 path.resolve(__dirname, md_path);
            /* 加入 Markdown 文本内容 */
            this.hidden_content.markdown_text =
                 fs.readFileSync(this.hidden_content.markdown_path, 'utf-8');
            /* 加入 csrf 属性值 */
            this.hidden_content.csrf = this._get_csrf(this.user_config["cookies"]);
            /* 转换 Markdown 文档为 HTML 代码 */
            this.hidden_content.html_text =
                 this._markdown_to_html(this.hidden_content.markdown_text);
            this.postHTMLForm(this._html_form_generate(), "article");
        }
        else {
            throw("Error");
        }
    }
    /* 功能函数: 检查 Markdown 文件名 */
    _check_markdown_path(md_path) {
        if(typeof(md_path) === "string" &&
           md_path.slice(-3) === '.md')
        {
            return true;
        }
        else {
            throw("Error: invaild Markdown file");
        }
    }
    /* 功能函数: 检查 cookies 配置项 */
    _check_cookies() {
        /* 检查 Cookies 是否包含关键字段 */
        if(this.user_config["cookies"].match(/sid=/g) === null ||
           this.user_config["cookies"].match(/DedeUserID=/g) === null ||
           this.user_config["cookies"].match(/DedeUserID__ckMd5=/g) === null ||
           this.user_config["cookies"].match(/bili_jct=/g) === null ||
           this.user_config["cookies"].match(/SESSDATA=/g) === null )
        {
            throw("Error: invaild cookies");
        }
        else {
            return true;
        }
    }
    /* 功能函数: 将json配置文件转换为js对象 */
    _cfg_json_to_obj(cfg_file_path) {
        /* 读取配置文件 */
        var cfg_abs_full_path = path.resolve(__dirname, cfg_file_path);
        /* 以 UTF-8 读取配置文件 */
        var cfg_content = fs.readFileSync(cfg_abs_full_path, "utf-8");
        /* 返回解析的对象 */
        return JSON.parse(cfg_content);
    }
    /* 功能函数: 从cookies中提取csrf信息 */
    _get_csrf(cookies_str) {
        cookies_str = cookies_str.split(';');
        for(var i = 0; i < cookies_str.length; i++) {
            cookies_str[i] = cookies_str[i].trim();
        }
        var csrf = "";
        for(var i = 0; i < cookies_str.length; i++) {
            /* 关键字段: `bili_jct` */
            if(cookies_str[i].indexOf("bili_jct=") == 0) {
                csrf = cookies_str[i].slice(
                       cookies_str[i].indexOf("=") + 1);
            }
        }
        /* 返回提取的字符串 */
        return csrf;
    }
    /* 功能函数: 检查用户是否定义了特定选项 */
    _check_user_config(key_str) {
        /* 如果有定义, 则返回true; 否则返回false */
        if(this.user_config[key_str] !== undefined) {
            return true;
        }
        else {
            return false;
        }
    }
    /* 核心函数: Markdown 转换 Bilibili Compatible HTML */
    _markdown_to_html(markdown_str) {
        /* 自定义生成器 */
        var myRenderer = new marked.Renderer();
        /* 覆写`标题`生成规则 */
        myRenderer.heading = function(text, level) {
            return '<h' + level + '>' + text +
                   '</h' + level + '>';
        }
        /* 覆写`图片`生成规则 */
        myRenderer.image = function(href, title, text) {
            return '<figure class="img-box">' +
                   '<img src="%src" />'.replace("%src", href) +
                   '<figcaption class="caption">%t</figcaption>'.replace(
                   "%t", text) +
                   '</figure>';
        }
        /* 覆写`删除线`生成规则 */
        myRenderer.del = function(text) {
            return '<span style="text-decoration: line-through;">' + text +
                   '</span>';
        }
        /* 生成器配置选项 */
        marked.setOptions({
            renderer: myRenderer,
            sanitize: true,    /* 内联 HTMl 功能: 禁用 */
            headerIds: false
        });
        /* 返回转换后 HTML 文本 */
        return marked(markdown_str);
    }
    /* 核心函数: 文本计数 */
    _html_words_count(html_str) {
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
        /* 返回文本长度 */
        return html_str.length;
    }
    /* 核心函数: 获取小结 */
    _html_get_summary(html_str) {
        /* 去除HTML tags */
        var summary_str = html_str.replace(/<\/?[^>]*>/g, '');
        /* 去除所有换行符 */
        summary_str = summary_str.replace(/\n/g, '');
        summary_str = summary_str.replace(/\r\n/g, '');
        /* 取前100字符 */
        return summary_str.slice(0, 100);
    }
    /* 核心函数: 生成HTML发送表单 */
    _html_form_generate() {
        /* 深拷贝表单模版 */
        var form_data = { };
        for(var key in this.form_template) {
            form_data[key] = this.form_template[key];
        }
        /* 加入用户自定义配置 */
        if(this._check_user_config("title") === true) {
            /* 使用用户自定义标题 */
            form_data["title"] = this.user_config["title"];
        }
        else {
            /* 使用默认标题(Markdown文件名) */
            var title_str = path.basename(this.hidden_content.markdown_path);
            title_str = title_str.slice(0, title_str.lastIndexOf('.'));
            form_data["title"] = title_str;
        }
        /* 加入 csrf 值 */
        form_data["csrf"]  = this.hidden_content["csrf"];
        /* 覆写目标数据 */
        var h_text = this.hidden_content.html_text;
        form_data["content"] = h_text;
        form_data["words"]   = this._html_words_count(h_text);
        form_data["summary"] = this._html_get_summary(h_text);
        /* 返回表单数据 */
        return form_data;
    }
    /* 核心函数: 提交表单数据 */
    postHTMLForm(src, flag_str) {
        if (flag_str === "image") {
            this._post_html_form(this._image_form_generate(src),
                                 flag_str,
                                 this._image_bili_process);
        }
        if (flag_str === "article") {
        }
    }
    _post_html_form(form_data, flag_str, callback) {
        /* 深拷贝公共提交头部 */
        var post_option = { };
        for(var key in this.post_option_template) {
            post_option[key] = this.post_option_template[key];
        }
        if (flag_str === "image") {
            /* B站专栏图片提交 API */
            post_option.host = 'member.bilibili.com'
            post_option.path = '/x/web/article/upcover';
            post_option.headers['Content-Length'] =
                Buffer.byteLength(querystring.stringify(form_data));
            post_option.headers['Cookie'] = this.user_config["cookies"];
            post_option.headers['X-Requested-With'] = 'XMLHttpRequest';
            /* 请求结构 */
            var req = http.request(post_option, function(res) {
                res.setEncoding('utf-8');
                console.log("StatusCode: ", res.statusCode);
                //console.log("Headers: ", JSON.stringify(res.headers));
                res.on('data', function(chunk) {
                    //console.log("Data: " + chunk);
                    callback(chunk);
                });
                res.on('end', function(chunk) {
                    //console.log("Successful!");
                });
            });
            req.on('error', function(e){
                console.error("Error: " + e.message);
            });
            /* 序列化表单数据 */
            req.write(querystring.stringify(form_data));
            /* 发送请求 */
            req.end();
        }
        if (flag_str === "article") {
            /* B站专栏提交 API */
            post_option.host = 'api.bilibili.com'
            post_option.path = '/x/article/creative/draft/addupdate';
            post_option.headers['Content-Length'] =
                Buffer.byteLength(querystring.stringify(form_data));
            post_option.headers['Cookie'] = this.user_config["cookies"];
            /* 请求结构 */
            var req = http.request(post_option, function(res) {
                res.setEncoding('utf-8');
                console.log("StatusCode: ", res.statusCode);
                //console.log("Headers: ", JSON.stringify(res.headers));
                res.on('data', function(chunk) {
                    console.log("Data: " + chunk);
                });
                res.on('end', function(chunk) {
                    //console.log("Successful!");
                });
            });
            req.on('error', function(e){
                console.error("Error: " + e.message);
            });
            /* 序列化表单数据 */
            req.write(querystring.stringify(form_data));
            /* 发送请求 */
            req.end();
        }
    }
    /* 功能函数: 图片处理 */
    _image_bili_process(bili_image_json) {
        /* 类型: JSON字符串 =>
		{ "code": 0,
		  "data": { "size": 157107,
                    "url": "" },
          "message": "0",
          "ttl": 1
        }
        */
        var img_res = JSON.parse(bili_image_json);
        /* 图片上传成功 */
        if(img_res['code'] === 0) {
            console.log(img_res.data.url);
            return img_res.data.url;
        }
        else {
            throw("Error: image uploads fail");
        }
    }
    /* 功能函数: 图片转 Base64 编码 */
    _image_to_base64(img_src) {
        /*  图片 Base64 格式头 */
        /*  .png  => data:image/png;base64,
            .jpeg => data:image/jpeg;base64,
            .gif  => data:image/gif;base64,  */
        if(img_src.indexOf('http') !== 0) {
            var img_prefix = "";
            var img_data = fs.readFileSync(img_src);
            var img_base64 = img_data.toString('base64');
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
            return img_prefix + img_base64;
        }
    }
    /* 生成图片发送表单 */
    _image_form_generate(abs_img_src) {
        /* 构建图片上传表单返回 */
        var img_post_form = {
            "cover": this._image_to_base64(abs_img_src),
            "csrf":  this._get_csrf(this.user_config["cookies"])
        };
        //console.log(img_post_form);
        return img_post_form;
    }
};
module.exports = biliZhuanlanMarkdown;
