"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var BiliColumnModule = __importStar(require("./BiliColumnMarkdown"));
var cliArgsArray = process.argv.splice(0);
if (cliArgsArray.length == 3) {
    console.log("[INFO]: Sending Markdown files to Bilibili server...");
    var uploadsMarkdownFile = function (markdownFilePath) {
        var userConfigFullPath = path.resolve(__dirname, "../config/config.json");
        var userConfig = fs.readFileSync(userConfigFullPath, "utf-8");
        var b = new BiliColumnModule.BiliColumnMarkdown();
        b.startProcess(markdownFilePath, JSON.parse(userConfig));
    };
    uploadsMarkdownFile(cliArgsArray[2]);
}
else {
    console.error("[ERROR]: CLI arguments do not fit...");
}
