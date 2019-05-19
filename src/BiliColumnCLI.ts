/**
 * Bilibili zhuanlan Markdown-Tool - CLI
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
import * as fs from "fs";
import * as path from "path";
import * as BiliColumnModule from "./BiliColumnMarkdown"
/* 分离命令行参数 */
let cliArgsArray: string[] = process.argv.splice(0);
if (cliArgsArray.length == 3) {
    console.log("[INFO]: Sending Markdown files to Bilibili server...");
    let uploadsMarkdownFile: (markdownFilePath: string) => void =
    function(markdownFilePath: string): void {
        // 读取配置文件
        let userConfigFullPath: string =
            path.resolve(__dirname, "../config/config.json");
        let userConfig = fs.readFileSync(userConfigFullPath, "utf-8");
        // 调用上传接口
        let b: BiliColumnModule.BiliColumnMarkdown = 
            new BiliColumnModule.BiliColumnMarkdown();
        b.startProcess(
            markdownFilePath, // <path/to/your/markdown/file>
            JSON.parse(userConfig)
        );
    };
    uploadsMarkdownFile(cliArgsArray[2]);
} else {
    console.error("[ERROR]: CLI arguments do not fit...");
}