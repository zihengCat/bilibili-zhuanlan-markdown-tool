/**
 * Bilibili zhuanlan Markdown-Tool - CLI Utilities
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
import * as fs from "fs";
import * as path from "path";
import * as BiliColumnModule from "./BiliColumnMarkdown"
/* Splice CLI arguments */
let cliArgsArray: string[] = process.argv.splice(0);
/* Show some infomations */
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
            break
            case "-v":
            case "--version":
                console.log("Bilibili zhuanlan Markdown Tool - CLI Utilities");
                console.log("v1.0.8");
                process.exit(0);
            break
        }
/* Do real works */
} else if (cliArgsArray.length === 3 &&
          !cliArgsArray[2].startsWith("-")) {
    console.log("[INFO]: Sending Markdown files to Bilibili server...");
    let uploadsMarkdownFile: (markdownFilePath: string) => void =
    function(markdownFilePath: string): void {
        /* Read user config file */
        let userConfigFullPath: string = path.resolve(
            __dirname,
            // TODO: Change hardcode `config.json` position.
            "../config/config.json"
        );
        let userConfig = fs.readFileSync(
            userConfigFullPath, "utf-8"
        );
        /* Call `BiliColumnMarkdown` uploads interface */
        let b: BiliColumnModule.BiliColumnMarkdown =
            new BiliColumnModule.BiliColumnMarkdown();
        b.startProcess(
            /* /a/path/to/markdown/file.md */
            markdownFilePath,
            JSON.parse(userConfig)
        );
    };
    uploadsMarkdownFile(cliArgsArray[2]);
/* Report an error */
} else {
    console.error("[ERROR]: CLI arguments do not fit...");
    console.error("\t See `--help` pages.");
}
/* EOF */
