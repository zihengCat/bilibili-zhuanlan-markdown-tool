/*
 * Bilibili zhuanlan Markdown-Tool - Web Server
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import * as querystring from "querystring";
import * as BiliColumnModule from "./BiliColumnMarkdown"
/* 创建 HTTP 服务器 */
http.createServer(function(request, response) {
    /* 读取前端 HTML 页面 */
    let HTMLIndexPath: string = path.resolve(
        __dirname, "../front_end/index.html"
    );
    let HTMLIndexData: string = fs.readFileSync(
        HTMLIndexPath, "utf-8"
    );
    /* 读取提交表单 */
    let body: string = "";
    request.on("data", function(chunk: any): void {
        body += chunk;
    });
    request.on("end", function(): void {
        let bodyObj: object = querystring.parse(body);
        response.writeHead(
            200,
            {'Content-Type': 'text/html; charset=utf-8'}
        );
        /* 核对信息无误 */
        if (bodyObj["md_file_path"] &&
            bodyObj["config_check"] === "ok") {
            /* 读取配置文件 */
            let configFullPath = path.resolve(
                __dirname,
                "../config/config.json"
            );
            let userConfig: string = fs.readFileSync(
                configFullPath,
                "utf-8"
            );
            /* 尝试提交 */
            try {
                /* 调用接口上传处理 */
                let b: BiliColumnModule.BiliColumnMarkdown =
                new BiliColumnModule.BiliColumnMarkdown();
                let userConfigObj: object = JSON.parse(userConfig);
                let userCookies: string = userConfigObj["cookies"];
                /* 启动处理流程 */
                b.startProcess(bodyObj["md_file_path"], userConfigObj);
                /* 返回成功页面 */
                let HTMLSuccessfulPath: string = path.resolve(
                    __dirname,
                    "../front_end/feedback_success.html"
                );
                let HTMLSuccessfulData = fs.readFileSync(
                    HTMLSuccessfulPath, "utf-8"
                );
                response.write(
                    HTMLSuccessfulData
                );
            }
            /* 出错 */
            catch(e) {
                /* 打印出错信息*/
                console.error("[ERROR]: " + e);
                /* 返回失败页面 */
                let HTMLFailedPath = path.resolve(
                    __dirname,
                    "../front_end/feedback_fail.html"
                );
                let HTMLFailedData = fs.readFileSync(
                    HTMLFailedPath, "utf-8"
                );
                response.write(
                    HTMLFailedData
                );
            }
        }
        /* 信息不足 */
        else {
            /* 返回主页面 */
            response.write(
                HTMLIndexData
            );
        }
        response.end();
    });
}).listen(2233); /* 本地监听端口号 -> 2233 */
/* 终端打印提示信息 */
console.log("[INFO]: Server running at http://127.0.0.1:2233/");