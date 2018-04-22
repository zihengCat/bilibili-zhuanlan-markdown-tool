/*
 * bilibili Zhuanlan Markdown Tool - CLI
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
const biliZhuanlanMarkdown = require('./bili_zhuanlan_markdown.js');
const pLoader = require('./preferences_loader.js');
/* 分离命令行参数 */
var args = process.argv.splice(2);
if(args.length != 2) {
    /* 命令行参数错误 */
    console.log("Error: Command Line arguments does not fit");
    console.log("Use: node cli.js [md_path] [pre_path]");
} else {
    biliZhuanlanMarkdown.startProcess (
        args[0],
        pLoader.startProcess(args[1])
    );
}
