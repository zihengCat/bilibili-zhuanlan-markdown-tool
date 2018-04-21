const biliZhuanlanMarkdown = require('./bili_zhuanlan_markdown.js');
const pLoader = require('./preferences_loader.js');
/*
 * 配置选项 (JSON)
  {
      "aid":     " ",
      "cookies": " "
  }
- aid     ->  文章标识号
- cookies -> `javascript:alert(document.cookie);`
              以下四枚 Cookie 必需, 有效期大概1个月（过期重取）
             "DedeUserID"
             "DedeUserID__ckMd5"
             "SESSDATA"
             "bili_jct"
 */
/*
 * API 说明
 * 参数: (Markdown 文档路径, 配置选项)
 * 处理流程: 取得 MD 文档与配置选项 -> Markdown 转换 HTML ->
 *           上传本地图片取得B站外链 -> 替换本地图片地址为B站外链地址 ->
 *           合成表单发送更新
 */
/*
biliZhuanlanMarkdown.startProcess (
    '../test/test.md',
    pLoader.startProcess('../preferences/settings.json')
);
*/
