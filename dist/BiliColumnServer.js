"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var http = __importStar(require("http"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var querystring = __importStar(require("querystring"));
var BiliColumnModule = __importStar(require("./BiliColumnMarkdown"));
var userConfigObj = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../config/config.json"), "utf-8"));
var listenWebPort = userConfigObj.hasOwnProperty("web.port")
    ? Number.parseInt(userConfigObj["web.port"])
    : 2233;
http.createServer(function (request, response) {
    var HTMLIndexPath = path.resolve(__dirname, "../front_end/index.html");
    var HTMLIndexData = fs.readFileSync(HTMLIndexPath, "utf-8");
    var body = "";
    request.on("data", function (chunk) {
        body += chunk;
    });
    request.on("end", function () {
        var bodyObj = querystring.parse(body);
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        if (bodyObj["md_file_path"]
            && bodyObj["config_check"] === "ok") {
            var configFullPath = path.resolve(__dirname, "../config/config.json");
            var userConfig = fs.readFileSync(configFullPath, "utf-8");
            try {
                var b = new BiliColumnModule.BiliColumnMarkdown();
                var userConfigObj_1 = JSON.parse(userConfig);
                var userCookies = userConfigObj_1["cookies"];
                b.startProcess(bodyObj["md_file_path"], userConfigObj_1);
                var HTMLSuccessfulPath = path.resolve(__dirname, "../front_end/feedback_success.html");
                var HTMLSuccessfulData = fs.readFileSync(HTMLSuccessfulPath, "utf-8");
                response.write(HTMLSuccessfulData);
            }
            catch (e) {
                console.error("[ERROR]: " + e);
                var HTMLFailedPath = path.resolve(__dirname, "../front_end/feedback_fail.html");
                var HTMLFailedData = fs.readFileSync(HTMLFailedPath, "utf-8");
                response.write(HTMLFailedData);
            }
        }
        else {
            response.write(HTMLIndexData);
        }
        response.end();
    });
}).listen(listenWebPort);
console.log("[INFO]: Server running at http://127.0.0.1:${web.port}/"
    .replace("${web.port}", listenWebPort.toString()));
