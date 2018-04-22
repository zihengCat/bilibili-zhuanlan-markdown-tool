/*
 * bilibili Zhuanlan Markdown Tool - Uploader
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
const biliZhuanlanMarkdown = require('./bili_zhuanlan_markdown.js');
const fs = require('fs');
const path = require('path');
/* 分离命令行参数 */
var args = process.argv.splice(2);
if(args.length != 1) {
    /* 命令行参数错误 */
    console.log("Error: Command Line arguments does not fit");
    console.log("Use: node upload.js [md_file]");
} else {
    /* 读取配置文件 */
    var abs_cfg_full_path = path.resolve(__dirname, '../config/config_full.json');
    var cfg = fs.readFileSync(abs_cfg_full_path, 'utf-8');
    /* 上传处理 */
    biliZhuanlanMarkdown.startProcess(args[0], JSON.parse(cfg));
}
