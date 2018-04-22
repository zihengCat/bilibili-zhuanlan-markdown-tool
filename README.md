# bilibili-zhuanlan-markdown-tool

![bilixmd][bilixmd]

这是一款可以让你使用`Markdown`撰写哔哩哔哩（bilibili.com）专栏文章的外部辅助工具。

# Usage（使用说明）

1. 本机安装`Node.js`环境。

2. 获取项目源码，使用`npm install`安装项目依赖。

3. 前往哔哩哔哩（bilibili.com）专栏投稿区，建立一篇专栏文章草稿。

4. 取得文章`aid`与`cookies`，写入配置文件。

5. 使用`Markdown`格式写作。

6. 运行`node src/cli.js [md_path] [config_path]`提交`Markdown`文章。

# Example（实例讲解）

通过一个实例，来教大家应该如何使用此工具。

## 步骤1, 2 - 安装环境与获取源码

此工具使用`Node.js`写成，要想使用它，你需要先在本机上安装好`Node.js`环境。
获取GitHub上的项目源码，可以使用`git`，也可以直接下载`zip`压缩包。对于`Node.js`项目，我们一般使用`npm install`来安装项目依赖。

## 步骤3 - 建立专栏文章草稿

完成了上述两步后，你的计算机上应该有了能正常运行的`Node.js`，以及此工具的源码包。以上两步都是常规动作。
接下来，前往哔哩哔哩（bilibili.com）专栏投稿区，建立一篇专栏文章草稿。
键入任意文章标题，这里文章的标题并不重要，可以随意写（但不写不行，标题不写无法存草稿），我们的目的只是**让一篇专栏文章成功保存草稿（即: 在B站服务器留下记录）**。如果不确定是否成功保存，可以点击专栏编辑区下方的*存草稿*按钮。

![step3_1][step3_1]

> 图: 建立专栏文章草稿

![step3_2][step3_2]

> 图: 保存专栏文章草稿

## 步骤4 - 获取目标参数写配置文件

**步骤4**是至关重要的一步。我们需要**手动**取得两枚关键参数，`aid`与`cookies`，再写出配置文件。其中，`aid`是专栏文章的标识号，`cookies`是用户个人身份认证信息。只有正确取得这两枚关键参数，工具才可与B站专栏服务器正常交互。
获取这两枚参数的方式都非常简单，`aid`在地址栏的URL参数上就有写明，`cookies`则可以使用**浏览器开发者工具**获得。

![step4_1][step4_1]

> 图: 获取`aid`参数

![step4_2][step4_2]

> 图: 获取`cookies`参数

我们将取得的两枚关键参数组合写成一个`.json`配置文件，配置文件的名字可以随意取。为了方便起见，我这里就将配置文件命名为`config.json`。

```
{
  "aid":     "4619",
  "cookies": "im_local_unread_1584633=0; _cnt_dyn=undefined; _cnt_pm=0; _cnt_notify=0; uTZ=-480; user_face=https%3A%2F%2Fi1.hdslb.com%2Fbfs%2Fface%2F6924d7e00ab833cc20bc97c7d4147308b84464ae.jpg; finger=0e029071; buvid3=9800BBA9-3DE9-4C50-99B1-29ABE518D62E59218infoc; im_seqno_1584633=22; CURRENT_QUALITY=15"
}
```

## 步骤5 - Markdown 写作

至此，所有准备工作均已完成。我们可以告别B站专栏富文本编辑器，转而使用`Markdown`撰写文章了。**拿起你最钟爱的一支`Markdown`编辑器，愉快地写文章吧！**

![step5][step5]

> 图: `Markdown`文章

## 步骤6 - 命令提交

最后，我们来将这篇`Markdown`格式的文章**变身**成为B站专栏文章。此工具正是帮助你完成这项任务的。我们通过运行命令来提交`Markdown`文章，请将你的文章与配置文件一并输入，注意先后顺序。如果命令没有报错，那说明提交成功。
```
$ node src/cli.js './test/Markdown来到了B站专栏.md' './test/config.json'
```
我们回到专栏草稿箱看一看，我们会发现，这篇`Markdown`格式的文章已经变身成为B站专栏文章了，排版、样式丝毫不差，静静地躺在专栏草稿箱之中，专栏文章的标题正是`Markdown`文件名。

![step6][step6]

> 图: 由`Markdown`变身的专栏文章（网页端预览）

预览文章，添加头图，选择分类，写专栏推荐语，这些都是文章发布前的准备工作。手动完成后就可以提请发布文章了。当然，B站是要审核的。

# Attentions（注意事项）

有一些注意事项你一定要知悉。

## 不支持的Markdown语法

目前，B站专栏所能提供的功能选项还非常有限，甚至连`Markdown`基本语法标准都无法达到完全支持。对于下列`Markdown`功能选项（甚至是常用选项），B站专栏目前还无法提供支持。对于扩展`Markdown`功能，更是没有可能。

- 六级标题
- 斜体文本
- 超链接
- 外链图片
- 代码块
- 表格
- 内联HTML

所以，如果你考虑将`Markdown`文章发布到B站专栏上，请**谨慎使用**上述语法格式，并考虑替代方案（如: 使用图片替换表格，代码块）。

## 专有功能

另外，B站也针对自家的专栏文章添加了一些**专有**功能选项，这些选项大多含有B站专栏特色。

- 字号
- 对齐
- 颜色
- 图片分割线
- 站内选项卡

这些选项大多没有合适的`Markdown`语法与之对应，只能通过**内联HTML**实现。

如果你分析过B站专栏的文章结构，就会发现，这些专有功能都是通过`class样式 + 行内css样式`实现的，并不具备可移植性，也不符合**结构与样式分离**的原则。

所以，**此工具并不对这些专有功能提供支持**。

当然，如果你想为你的`Markdown`文章添加B站专有功能，完全可以在使用此工具提交后回到B站专栏富文本编辑器中手动修改。

# Configure（配置选项）

此工具的`json`配置文件非常简单，就像这样:

```
{
  "aid":     "",
  "cookies": ""
}
```

更加详细的说明：

```
- aid     ->  文章标识号
- cookies ->  以下四枚 Cookie 必需, 有效期大概1个月（过期重取）
             "DedeUserID"
             "DedeUserID__ckMd5"
             "SESSDATA"
             "bili_jct"
```

# Develop（开发相关）

利用该工具的代码小例子：

```
/*
 * API 说明
 * 参数: (Markdown 文档路径, 配置选项)
 * 处理流程: 取得 MD 文档与配置选项 -> Markdown 转换 HTML ->
 *           上传本地图片取得B站外链 -> 替换本地图片地址为B站外链地址 ->
 *           合成表单发送更新
 */
biliZhuanlanMarkdown.startProcess (
    './test.md',
    {
      "aid":     "",
      "cookies": ""
    }
);
```

# License（许可协议）

[MIT](./LICENSE)

[bilixmd]: ./docs/bilixmd.png
[step3_1]: ./docs/step3_1.png
[step3_2]: ./docs/step3_2.png
[step4_1]: ./docs/step4_1.png
[step4_2]: ./docs/step4_2.png
[step5]:   ./docs/step5.png
[step6]:   ./docs/step6.png

