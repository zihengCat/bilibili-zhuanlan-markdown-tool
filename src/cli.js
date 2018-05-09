/*
 * Bilibili Zhuanlan Markdown Tool - CLI
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
const fs = require('fs');
const path = require('path');
const biliZhuanlanMarkdown = require('./bili_zhuanlan_markdown.js');
/* 分离命令行参数 */
var args = process.argv.splice(2);
if(args.length != 1) {
    /* 命令行参数错误 */
    console.log("Error: Command Line argument does not fit");
    console.log("Use: node cli.js [md_file]");
} else {
    /* 读取配置文件 */
    var abs_cfg_full_path = path.resolve(__dirname, '../config/config.json');
    var cfg = fs.readFileSync(abs_cfg_full_path, 'utf-8');
    /* 调用上传接口(旧) */
    biliZhuanlanMarkdown.startProcess(args[0], JSON.parse(cfg));
    /* 调用上传接口(新) */
    //var cookie = JSON.parse(cfg);
    //cookie = cookie['cookies'];
    //biliZhuanlanMarkdown.initStatus(cookie);
    //biliZhuanlanMarkdown.sendArticle(args[0]);
}
