/*
 * Bilibili zhuanlan Markdown Tool - Unit Tests
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
"use strict";
const biliZhuanlanMarkdown = require('./bili_zhuanlan_markdown.js');
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
    if (biliZhuanlanMarkdown.md2Html('```plain\nhello\n```') !=
    '<figure class="code-box"><pre class="language-plain" data-lang="plain"><code class="language-plain">hello</code></pre></figure>'
    ) {
        throw new Error("Test failed: Markdown `code block`");
    }
    if (biliZhuanlanMarkdown.md2Html('`hello`') !=
    '<p><code>hello</code></p>\n'
    ) {
        throw new Error("Test failed: Markdown `inline code`");
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
        console.log("[LOG]: `init_process` Successful!");
        md2html_test();
        console.log("[LOG]: `Markdown` to `HTML` Passed!");
        words_count_test();
        console.log("[LOG]: `wordsCount` Passed!");
        console.log("[LOG]: All Unit Tests Passed!");
    } catch(err) {
        console.log("[ERR]: " + err);
    }
}
main_test();
