# bilibili-zhuanlan-markdown-tool

[![NPM](https://img.shields.io/npm/v/bilibili-zhuanlan-markdown-tool.svg?style=flat)](https://www.npmjs.com/package/bilibili-zhuanlan-markdown-tool)
[![Build Status](https://travis-ci.org/zihengCat/bilibili-zhuanlan-markdown-tool.svg?branch=master)](https://travis-ci.org/zihengCat/bilibili-zhuanlan-markdown-tool)

![bilixmd][bilixmd]

这是一款可以让你使用`Markdown`撰写**哔哩哔哩（bilibili.com）专栏文章**的辅助工具。

# Usage（使用说明）

1. 本机安装`Node.js`环境，获取项目源码，`npm install`安装依赖。

2. 取得用户认证`cookies`，写入配置文件。

3. 使用`Markdown`写作。

4. 使用**前端页面**或**命令行工具**提交`Markdown`文章。

# Example（实例讲解）

下面将通过一个实例，详细讲解如何使用此工具。

## 步骤1 - 安装环境与获取源码

此工具使用`Node.js`写成，要想使用它，你需要先在本机上安装好`Node.js`环境。

获取*GitHub*上的项目源码，可以使用`git`，也可以直接下载`zip`压缩包。对于`Node.js`项目，我们一般使用`npm install`来安装项目依赖。

## 步骤2 - 获取关键参数写配置文件

这是至关重要的一步。我们需要**手动**取得关键参数`cookies`写入配置文件。`cookies`是用户个人身份认证信息。此工具依赖该参数与B站专栏服务器正常通信。

我们可以使用**Chrome开发者工具**获取到参数。具体如下：

1. 前往[B站AJAX快速登录页](https://passport.bilibili.com/ajax/miniLogin/minilogin)
2. 打开*Chrome开发者工具 -> 网络侦测器*
3. 填写B站登录信息
4. 从跨域跳转响应页中抓取`cookie`参数

![step2][step2]

> 图: 获取`cookies`参数

将取得的关键参数写入到`./config/config.json`配置文件中，格式可以参考模版或阅读配置选项。

## 步骤3 - Markdown 写作

至此，所有准备工作均已完成。我们可以告别B站专栏富文本编辑器，转而使用`Markdown`撰写文章了。**拿起你最钟爱的一支`Markdown`编辑器，愉快地写文章吧:)**

![step3][step3]

> 图: 写`Markdown`文章

## 步骤4 - 提交文章

文章写完了，我们来将这篇`Markdown`格式的文章**变身**成为B站专栏文章。此工具正是帮助你完成这项任务的。

此工具提供两种提交方式: **前端窗口提交**与**命令行提交**。这里演示使用前端窗口提交。

我们运行命令来启动工具前端窗口，填入相关参数，点击提交，如果反馈成功，则说明提交成功。

```bash
$ npm run server
```

![step4_1][step4_1]

> 图: 工具前端页面

![step4_2][step4_2]

> 图: 提交成功反馈页面

现在我们可以回到B站专栏草稿箱看一看，我们会发现，这篇`Markdown`格式的文章已经**变身**成为B站专栏文章了，排版、样式丝毫不差，静静地躺在专栏草稿箱中，专栏文章的标题是`Markdown`文件名。

![step4_3][step4_3]

> 图: 由`Markdown`变身的专栏文章（网页端预览）

预览文章，添加头图，选择分类，写专栏推荐语，这些都是文章发布前的准备工作，就交给你手动完成。完成后可以提请发布文章。当然，B站是要审核的。

# Attentions（注意事项）

这里有一些注意事项你一定要了解。

## 不支持的Markdown语法

目前，B站专栏所能提供的功能选项还非常有限，甚至连`Markdown`基本语法标准都无法达到完全支持。对于下列`Markdown`功能选项（甚至是常用选项），B站专栏目前还无法提供支持。对于扩展`Markdown`功能，更是没有可能。

- 六级标题
- 斜体文本
- 超链接
- 外链图片
- 代码块
- 表格
- 内联HTML

所以如果你考虑将`Markdown`文章发布到B站专栏上，请**谨慎使用**上述语法格式，并考虑替代方案（如: 使用图片替换表格，代码块）。

## 专有功能

另外，B站也针对自家的专栏文章添加了一些**专有**功能选项，这些选项大多含有B站特色。

- 字号
- 对齐
- 颜色
- 图片分割线
- 站内选项卡

这些选项大多没有合适的`Markdown`语法与之对应，只能通过**内联HTML**实现。

如果你分析过B站专栏的文章结构，就会发现，这些专有功能都是通过`class样式 + 行内css样式`实现的，并不具备可移植性，也不符合**结构与样式分离**的原则。

所以**此工具并不对这些专有功能提供支持**。

当然，如果你想为你的`Markdown`文章添加B站专有功能，完全可以在使用此工具提交后回到B站专栏富文本编辑器中手动修改。

# Configure（配置选项）

此工具的`json`配置文件非常简单，就像这样:

```
{
  "cookies": ""
}
```

更加详细的说明：

```
cookies ->  以下 Cookie 必需，有效期大约半月（过期重取）
            "sid"
            "DedeUserID"
            "DedeUserID__ckMd5"
            "bili_jct"
            "SESSDATA"
```

# Develop（开发相关）

集成该工具开发，需要先`npm install`安装，再导入`bilibili-markdown-tool`模块。

```bash
$ npm install bilibili-markdown-tool --save
```

| API | 说明 |
|:----|:-----|
| `initStatus(cookies_str)` | 初始化函数，接受用户认证`Cookie`信息  |
| `sendArticle(markdown_path)` | 发送一篇本地`Markdown`文章至目标用户B站专栏草稿箱|
| `startProcess(markdown_path, config_object)` | 以上两函数的综合，接受`Markdown`路径与用户自定义配置选项 |

> 表: 模块`API`接口表

# License（许可协议）

[MIT](./LICENSE)

[bilixmd]: ./docs/bilixmd.png
[step2]:   ./docs/step2.png
[step3]:   ./docs/step3.png
[step4_1]: ./docs/step4_1.png
[step4_2]: ./docs/step4_2.png
[step4_3]: ./docs/step4_3.png

