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
if (cliArgsArray.length === 3 &&
    cliArgsArray[2].startsWith("-")) {
    switch (cliArgsArray[2]) {
        case "-h":
        case "--help":
            console.log("Bilibili zhuanlan Markdown Tool - CLI Utilities");
            console.log("Usage:");
            console.log("\tnode cli.js [options] file.md");
            console.log("Options:");
            console.log("\t-h, --help\t\tShow help pages");
            console.log("\t-v, --version\t\tShow versions");
            console.log("Examples:");
            console.log("\tnode cli.js <path/to/your/markdown/file.md>");
            process.exit(0);
            break;
        case "-v":
        case "--version":
            console.log("Bilibili zhuanlan Markdown Tool - CLI Utilities");
            console.log("v1.0.8");
            process.exit(0);
            break;
    }
}
else if (cliArgsArray.length === 3 &&
    !cliArgsArray[2].startsWith("-")) {
    console.log("[INFO]: Sending markdown files to bilibili server...");
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
    console.error("\t See `--help` pages.");
}
