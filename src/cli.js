/*
 * Bilibili zhuanlan Markdown Tool - CLI
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
"use strict";
// ----------------------
const fs = require("fs");
const path = require("path");
// ----------------------
const biliZhuanlanMarkdown = require("./bili_zhuanlan_markdown.js");
const biliLoginModule = require("./bili_zhuanlan_login.js");
// ----------------------
/* 分离命令行参数 */
var args = process.argv.splice(2);
var username = "";
var password = "";
var set_flag = "";
var markdown_file = "";
for(var i = 0; i < args.length; ++i) {
    if(args[i] === "-u" ||
       args[i] === "--username"
    ) {
        username = args[i + 1];
    }
    else if (
       args[i] === "-p" ||
       args[i] === "--password"
    ) {
        password = args[i + 1];
    }
    else if (
       args[i] === "-f" ||
       args[i] === "--file"
    ) {
        markdown_file = args[i + 1];
    }
    else if (
       args[i] === "-s" ||
       args[i] === "--set"
    ) {
        set_flag = "1";
    }
    else if (
       args[i] === "-h" ||
       args[i] === "--help"
    ) {
        console.log("Bilibili zhuanlan Markdown Tool - CLI Utilities");
        console.log("Usage:");
        console.log("\tnode cli.js [options]");
        console.log("Options:");
        console.log("\t-h, --help\t\tShow help pages");
        console.log("\t-v, --version\t\tShow versions");
        console.log("\t-f, --file\t\tUpload `markdown.md` to bilibili zhuanlan");
        console.log("\t-u, --username\t\tSpecify bilibili `username`");
        console.log("\t-p, --password\t\tSpecify bilibili `password`");
        console.log("\t-s, --set\t\tSave specify `cookies` to `config.json`");
        console.log("Examples:");
        console.log("\tnode cli.js -f <path/to/markdown/file.md>");
        console.log("\tnode cli.js -u <username> -p <password>");
        console.log("\tnode cli.js -u <username> -p <password> -s");
        process.exit(0);
    }
    else if (
       args[i] === "-v" ||
       args[i] === "--version"
    ) {
        console.log("v1.0.6");
        process.exit(0);
    }
}
if(username !== "" &&
   password !== ""
) {
    console.log("[INFO]: Username = " + username);
    console.log("[INFO]: Password = " + password);
    console.log("[INFO]: Geting bilibili user specified `cookies`...");
    biliLoginModule.initStatus(username, password);
    biliLoginModule.getCookies();
    //biliLoginModule.__get_bili_hash_key();
    if(set_flag === "1") {
        //biliLoginModule.saveCookiesToConfigFile();
        console.log("[INFO]: User `cookies` saved to `config.json` successful!");
    }
}
if(markdown_file !== "") {
    console.log("[INFO]: Sending markdown files...");
    let uploads_markdown_file = function(markdown_file) {
        // 读取配置文件
        let abs_cfg_full_path = path.resolve(__dirname, '../config/config.json');
        let cfg = fs.readFileSync(abs_cfg_full_path, 'utf-8');
        // 调用上传接口(旧)
        biliZhuanlanMarkdown.startProcess(markdown_file, JSON.parse(cfg));
        // 调用上传接口(新)
        //var cookie = JSON.parse(cfg);
        //cookie = cookie['cookies'];
        //biliZhuanlanMarkdown.initStatus(cookie);
        //biliZhuanlanMarkdown.sendArticle(args[0]);
    }
    uploads_markdown_file(markdown_file);
    process.exit(0);
}
if(
    (username === "" || password === "") &&
    markdown_file === ""
) {
    console.log("[ERROR]: Command Line Arguments does not fit.");
    console.log("\t See `--help` pages.");
}
