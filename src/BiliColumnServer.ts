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
/* Create a tiny HTTP server */
http.createServer(function(request, response) {
    /* Read front-end `index.html` page */
    let HTMLIndexPath: string = path.resolve(
        __dirname, "../front_end/index.html"
    );
    let HTMLIndexData: string = fs.readFileSync(
        HTMLIndexPath, "utf-8"
    );
    /* Read user posted web form */
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
        /* Check key points */
        if (bodyObj["md_file_path"] &&
            bodyObj["config_check"] === "ok") {
            /* Read user config file */
            let configFullPath = path.resolve(
                __dirname,
                // TODO: Change hardcode `config.json` position.
                "../config/config.json"
            );
            let userConfig: string = fs.readFileSync(
                configFullPath,
                "utf-8"
            );
            /* Try uploading */
            try {
                /* Call `BiliColumnMarkdown` uploads interface */
                let b: BiliColumnModule.BiliColumnMarkdown =
                new BiliColumnModule.BiliColumnMarkdown();
                let userConfigObj: object = JSON.parse(userConfig);
                let userCookies: string = userConfigObj["cookies"];
                /* Start processing flow */
                b.startProcess(bodyObj["md_file_path"], userConfigObj);
                /* No exceptions -> feedback_success.html */
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
            /* Something error */
            catch(e) {
                /* Print error messages to console */
                console.error("[ERROR]: " + e);
                /* Exceptions occurred -> feedback_fail.html */
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
        /* Can not determined -> index.html */
        else {
            response.write(
                HTMLIndexData
            );
        }
        response.end();
    });
}).listen(2233); /* Listening port -> 2233 */
/* Show infomations to console */
console.log("[INFO]: Server running at http://127.0.0.1:2233/");