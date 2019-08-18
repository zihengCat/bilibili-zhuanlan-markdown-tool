"use strict";
var BiliColumnCore = require("./BiliColumnMarkdown.js");
function csrfGenerateTest() {
    console.log("[LOG]: Testing b.csrfGenerate() ...");
    var b = new BiliColumnCore.BiliColumnMarkdown();
    var testCookiesText = {
        "cookies": "sid=i5ich24k; DedeUserID=1584633; DedeUserID__ckMd5=f762b0c61c31debe; bili_jct=654ece1b596f63ee499f6ee613ccce2c; SESSDATA=214dbb5b%2C1529949492%2C209278b7"
    };
    b.csrfGenerate(testCookiesText["cookies"]);
    try {
        b.csrfGenerate("abc123");
    }
    catch (err) {
    }
    console.log("[LOG]: Testing b.csrfGenerate() Passed!");
}
function markdownToHTMLTest() {
    console.log("[LOG]: Testing b.markdownToHTML() ...");
    var b = new BiliColumnCore.BiliColumnMarkdown();
    if (b.markdownToHTML('# heading1').trim() !== "<h1>heading1</h1>"
        || b.markdownToHTML('## heading2').trim() !== "<h2>heading2</h2>"
        || b.markdownToHTML('### heading3').trim() !== "<h3>heading3</h3>"
        || b.markdownToHTML('#### heading4').trim() !== "<h4>heading4</h4>"
        || b.markdownToHTML('##### heading5').trim() !== "<h5>heading5</h5>"
        || b.markdownToHTML('###### heading6').trim() !== "<h6>heading6</h6>") {
        throw new Error("[FAIL]: In Markdown `heading`");
    }
    if (b.markdownToHTML('paragraph') !==
        "<p>paragraph</p>\n") {
        throw new Error("[FAIL]: In Markdown `paragraph`");
    }
    if (b.markdownToHTML('**text**') !==
        '<p><strong>text</strong></p>\n') {
        throw new Error("[FAIL]: In Markdown `strong`");
    }
    if (b.markdownToHTML('```plain\nhello\n```') !==
        '<figure class="code-box"><pre class="language-plain" data-lang="plain"><code class="language-plain">hello</code></pre></figure>') {
        throw new Error("[FAIL]: In Markdown `code block`");
    }
    if (b.markdownToHTML('`hello`') !==
        '<p><code>hello</code></p>\n') {
        throw new Error("[FAIL]: In Markdown `inline code`");
    }
    console.log("[LOG]: Testing b.markdownToHTML() Passed!");
}
function wordsCountTest() {
    console.log("[LOG]: Testing b.wordsCount() ...");
    var b = new BiliColumnCore.BiliColumnMarkdown();
    if (b.wordsCount('<p>12345</p>') != 5 ||
        b.wordsCount('<p>你好</p>') != 2) {
        throw new Error("[FAIL]: In `wordsCount`");
    }
    console.log("[LOG]: Testing b.wordsCount() Passed!");
}
function mainTestsSet() {
    try {
        csrfGenerateTest();
        markdownToHTMLTest();
        wordsCountTest();
    }
    catch (err) {
        throw err;
    }
}
mainTestsSet();
