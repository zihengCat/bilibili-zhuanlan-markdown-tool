/*
 * Bilibili Zhuanlan Markdown Tool - Unit Test
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
const biliZhuanlanMarkdown = require('./bili_zhuanlan_markdown.js');

//var bl = biliZhuanlanMarkdown.biliZhuanlanMarkdown;

/* 测试初始化函数 */
function initStatus_test() {
    var test_cookies = {
        "cookies":
        "sid=i5ich24k; DedeUserID=1584633; DedeUserID__ckMd5=f762b0c61c31debe; bili_jct=654ece1b596f63ee499f6ee613ccce2c; SESSDATA=214dbb5b%2C1529949492%2C209278b7"
    };
    biliZhuanlanMarkdown.initStatus(test_cookies["cookies"]);
}
/* 测试 Markdown 转换 HTML 功能 */
function md2html_test() {
    if (biliZhuanlanMarkdown.md2Html('# heading1').trim()      !== "<h1>heading1</h1>"
    ||  biliZhuanlanMarkdown.md2Html('## heading2').trim()     !== "<h2>heading2</h2>"
    ||  biliZhuanlanMarkdown.md2Html('### heading3').trim()    !== "<h3>heading3</h3>"
    ||  biliZhuanlanMarkdown.md2Html('#### heading4').trim()   !== "<h4>heading4</h4>"
    ||  biliZhuanlanMarkdown.md2Html('##### heading5').trim()  !== "<h5>heading5</h5>"
    ||  biliZhuanlanMarkdown.md2Html('###### heading6').trim() !== "<h6>heading6</h6>"
    )
    {
        throw new Error("Test failed: Markdown `heading`");
    }
    if (biliZhuanlanMarkdown.md2Html('paragraph') != "<p>paragraph</p>\n")
    {
        throw new Error("Test failed: Markdown `paragraph`");
    }
    if (biliZhuanlanMarkdown.md2Html('**text**') !=
                                     '<p><strong>text</strong></p>\n'
    )
    {
        throw new Error("Test failed: Markdown `strong`");
    }

}
/* 测试字符计数功能 */
function words_count_test() {
    if(biliZhuanlanMarkdown.wordsCount('<p>12345</p>') != 5
    || biliZhuanlanMarkdown.wordsCount('<p>你好</p>')  != 2)
    {
        throw new Error("Test failed: `wordsCount`");
    }
}
/* 测试集合 */
function main_test() {
    try {
        initStatus_test();
        console.log("LOG: `init` successful!");
        md2html_test();
        console.log("LOG: `Markdown` to `HTML` passed!");
        words_count_test();
        console.log("LOG: `wordsCount` passed!");
        console.log("LOG: ALL Passed!");
    } catch(err) {
        console.err("ERR:" + err);
    }
}
main_test();
