import http = require("http");
import https = require("https");
import querystring = require("querystring");
import crypto = require("crypto");
class BilibiliLogin {
    constructor() {
        // ...
    }
    public getAccessKey(user: string, pass: string): void {
        let post_data: object = {
            "user":   user,
            "passwd": pass,
        };
        //let content: string = querystring.stringify(post_data);
        let content: string =
        "user=" + user + "&" + "passwd=" + pass;
        /*
         * https://api.kaaass.net/biliapi/user/login
         * user: string
         * passwd: string
         */
        let options: object = {
            protocol: "https:",
            host: "api.kaaass.net",
            path: "/biliapi/user/login",
            port: 443,
            method: "POST",
            headers: {
                //"Content-Type": "application/x-www-form-urlencoded"
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
        };
        let req = https.request(options, function (res) {
            //console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding("utf8");
            res.on('data', function (chunk) {
                if(res.statusCode === 200) {
                    console.log(chunk);
                    let c = JSON.parse(chunk);
                    if(c.access_key !== undefined) {
                        console.log("[INFO]: access_key = " + c.access_key);
                    }
                }
                else {
                    console.log(chunk);
                    throw("[ERROR]: IN `get_access_key` " + res.statusCode);
                }
            });
        });
        req.on('error', function (e) {
            console.log('[ERROR]: problem with request: ' + e.message);
        });
        // write data to request body
        console.log(content);
        req.write(content);
        //req.write(req_string);
        req.end();
    };
}
let c = new BilibiliLogin();
