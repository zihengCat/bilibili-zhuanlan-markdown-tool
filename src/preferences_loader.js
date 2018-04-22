/*
 * bilibili Zhuanlan Markdown Tool - Preferences Loader
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
const fs = require('fs');
var preferencesLoader =  {
    /* 从 Cookies 文本中获取 `csrf` */
    get_csrf: function (cookies_str) {
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
    },
    /* 入口函数 */
    startProcess: function (preferences_path) {
        var pform = fs.readFileSync(preferences_path, 'utf-8');
        pform = JSON.parse(pform);
        pform["csrf"] = this.get_csrf(pform["cookies"]);
        return pform;
    }
}
module.exports = preferencesLoader;
