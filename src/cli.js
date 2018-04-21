const biliZhuanlanMarkdown = require('./bili_zhuanlan_markdown.js');
const pLoader = require('./preferences_loader.js');

var args = process.argv.splice(2);

if(args.length != 2) {
    console.log("Error: command line arguments does not fit");
    console.log("use: node cli.js [md_path] [pre_path]");
} else {
    biliZhuanlanMarkdown.startProcess (
        args[0],
        pLoader.startProcess(args[1])
    );
}
