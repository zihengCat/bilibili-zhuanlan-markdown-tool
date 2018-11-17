/*
 * Bilibili zhuanlan Markdown Tool - Login Module
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
"use strict";
/* Core Standard Libraries */
const http = require("http");
const https = require("https");
const querystring = require("querystring");
// ----------------------------------------
var BilibiliLoginModule = {
    initStatus: function(user = "", passwd = "") {
        this.__user = user;
        this.__passwd = passwd;
    },
    getCookies: function() {
        this.__get_access_key();
    },
    __get_access_key: function() {
        let post_data = {
            "user": this.__user,
            "passwd": this.__passwd,
        };
        let content = querystring.stringify(post_data);
        let options = {
            host: "api.kaaass.net",
            path: "/biliapi/user/login",
            port: 443,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
        };
        let req = https.request(options, function (res) {
            //console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                //console.log('BODY: ' + chunk);
                //console.log(chunk);
                var c = JSON.parse(chunk);
                if(c.access_key !== undefined) {
                    console.log(c.access_key);
                    BilibiliLoginModule.__get_cookies(c.access_key);
                }
            });
        });
        req.on('error', function (e) {
            console.log('[ERROR]: problem with request: ' + e.message);
        });
        // write data to request body
        req.write(content);
        req.end();
    },
    __get_cookies: function(access_key) {
        let options = {
            protocol: "https:",
            host: "api.kaaass.net",
            path: "/biliapi/user/sso?access_key=" + access_key,
            port: 443,
            method: "GET",
        };
        let req = https.request(options, function (res) {
            //console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log(chunk);
            });
        });
        req.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });
        req.end();
    },
}
module.exports = BilibiliLoginModule;
