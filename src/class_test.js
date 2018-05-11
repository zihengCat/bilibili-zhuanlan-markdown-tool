"use strict";
const fs = require('fs');
const path = require('path');
const biliMarkdownClass = require('./bili_zhuanlan_markdown_class.js');

/* 分离命令行参数 */
var args = process.argv.splice(2);
if(args.length != 1) {
    /* 命令行参数错误 */
    console.log("Error: Command Line argument does not fit");
    console.log("Use: node xxx.js [md_file]");
} else {
    /* 读取配置文件 */
    var abs_cfg_full_path = path.resolve(__dirname, '../config/config.json');
    var cfg = fs.readFileSync(abs_cfg_full_path, 'utf-8');
    var b = new biliMarkdownClass(JSON.parse(cfg));
    console.log(b);
    b.sendArticle(args[0]);
    console.log(b);
}

