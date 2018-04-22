/*
 * bilibili Zhuanlan Markdown Tool - Unit Test
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
const biliZhuanlanMarkdown = require('./bili_zhuanlan_markdown.js');
/* 测试 Markdown 转换 HTML 功能 */
function md2html_test() {
    if (biliZhuanlanMarkdown.md2Html('# heading1')     != "<h1>heading1</h1>"
    ||  biliZhuanlanMarkdown.md2Html('## heading2')    != "<h2>heading2</h2>"
    ||  biliZhuanlanMarkdown.md2Html('### heading3')   != "<h3>heading3</h3>"
    ||  biliZhuanlanMarkdown.md2Html('#### heading4')  != "<h4>heading4</h4>"
    ||  biliZhuanlanMarkdown.md2Html('##### heading5') != "<h5>heading5</h5>"
    )
    {
        throw new Error("Test failed: in Markdown `heading`");
    }
    if (biliZhuanlanMarkdown.md2Html('paragraph') != "<p>paragraph</p>\n")
    {
        throw new Error("Test failed: in Markdown `paragraph`");
    }
    if (biliZhuanlanMarkdown.md2Html('**text**') !=
                                     '<p><strong>text</strong></p>\n'
    )
    {
        throw new Error("Test failed: in Markdown `strong`");
    }

}
/* 测试字符计数功能 */
function words_count_test() {
    if(biliZhuanlanMarkdown.wordsCount('<p>12345</p>') != 5
    || biliZhuanlanMarkdown.wordsCount('<p>你好</p>')  != 2)
    {
        throw new Error("Test failed: in words count");
    }
}
/* 测试集 */
function main_test() {
    md2html_test();
    words_count_test();
}
main_test();
