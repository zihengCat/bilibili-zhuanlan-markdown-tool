# Bilibili zhuanlan Markdown-Tool

[![NPM](https://img.shields.io/npm/v/bilibili-zhuanlan-markdown-tool.svg?style=flat)](https://www.npmjs.com/package/bilibili-zhuanlan-markdown-tool)
[![Build Status](https://travis-ci.org/zihengCat/bilibili-zhuanlan-markdown-tool.svg?branch=master)](https://travis-ci.org/zihengCat/bilibili-zhuanlan-markdown-tool)
[![Build status](https://ci.appveyor.com/api/projects/status/ffdmliolluxi9s51/branch/master?svg=true)](https://ci.appveyor.com/project/zihengCat/bilibili-zhuanlan-markdown-tool/branch/master)

![bilixmd][bilixmd]

这是一款可以让你使用`Markdown`文本标记语言撰写**哔哩哔哩（bilibili.com）专栏文章**的辅助工具。

# Usage（使用说明）

1. 本机安装`Node.js`环境，获取项目源码，`npm install`安装依赖。

2. 取得用户认证`cookies`，写入配置文件。

3. 使用`Markdown`写作。

4. 使用**前端窗口**或**命令行接口**提交`Markdown`文章。

# Work Flow（工作原理）

B站专栏文章使用`HTML`对专栏文章进行存储与展示。无论是使用B站富文本编辑器还是`Markdown`，最终都会转换为`HTML`上传至B站服务器保存，并在用户需要时调取展示。

此工具完成的任务，便是将`Markdown`转换为`Bilibili Compatible HTML`，再自动上传至B站服务器。

![work_flow][work_flow]

> 图：工作原理示意图

# Example（实例讲解）

下面通过一个实例，详细讲解如何使用此工具。

## Step 1 - 安装环境与获取源码

此工具使用`Node.js`写成，要想使用它，需要先在本机上安装好`Node.js`环境。

> `Node.js`官网：https://nodejs.org/

获取 GitHub 上的项目源码，可以使用`git clone`，也可以直接下载`zip`压缩包。对于`Node.js`项目，我们一般使用`npm install`来安装项目依赖。

## Step 2 - 获取关键参数写配置文件

这是至关重要的一步。我们需要**手动**取得认证参数`cookies`并写入配置文件。`cookies`是用户个人身份认证信息，此工具依赖该认证参数与B站专栏服务器正常通信。

我们可以使用**Chrome开发者工具**获取该参数。具体步骤如下：

1. 前往[B站AJAX快速登录页](https://passport.bilibili.com/ajax/miniLogin/minilogin)
2. 打开*Chrome开发者工具 >> 网络侦测器*
3. 填写B站登录信息与验证码
4. 从跨域跳转响应页中取得`cookie`参数

![step2][step2]

> 图：获取`cookies`参数

将取得的`cookies`认证参数写入`config/config.json`配置文件中，格式可参看**配置选项**。

## Step 3 - Markdown 写作

至此，所有准备工作均已完成。我们可以告别B站专栏富文本编辑器，转而使用`Markdown`撰写文章了。**拿起你最钟爱的一支`Markdown`编辑器，愉快地写文章吧。**

![step3][step3]

> 图：撰写`Markdown`文章

## Step 4 - 提交文章

文章写完，我们将这篇`Markdown`格式的文章**变身**成为B站专栏文章。

工具提供两种提交接口: **前端窗口提交**与**命令行提交**。

提交成功后，我们可以回到B站专栏草稿箱查看。`Markdown`格式文章已被提交到B站专栏文章草稿箱中，排版、样式准确。专栏文章标题默认为`Markdown`文件名。

### 前端窗口提交

我们运行命令来启动工具前端窗口，键入`Markdown`文件「绝对路径」，点击提交按钮。如果反馈成功，则说明提交成功。

```bash
$ npm run server
```
> 代码清单：启动工具前端窗口

![step4_1][step4_1]

> 图：工具前端页面

![step4_2][step4_2]

> 图：提交成功反馈页面

### 命令行提交

使用命令行（CLI）提交则更加简洁明了，还可以配合脚本实现批量化提交。

```bash
# 绝对路径 or 相对路径均可
$ npm run cli <path/to/your/markdown/file.md>
```
> 代码清单：使用命令行（CLI）工具

### 发布前准备工作

预览文章、添加头图、选择分类、撰写专栏推荐语，这些都是文章发布前的准备工作，手动完成后即可提请发布文章了，当然，B站要审核文章。**目前，B站专栏还不支持修改发布后的专栏文章。**

![step4_3][step4_3]

> 图：`Markdown`转换专栏文章「网页端预览」

# Attentions（注意事项）

这里有一些注意事项你务必要了解。

## 不支持的 Markdown 语法

目前，B站专栏所能提供的功能选项还非常有限，甚至连`Markdown`基本语法标准都无法达到完全支持。对于下列`Markdown`语法项（甚至是常用选项），B站专栏目前还无法提供支持。对于扩展`Markdown`功能，更是没有可能。

- 六级标题「可用」
- 斜体文本
- 外部超链接「可用」
- 外链图片「可用」
- 行内代码「可用」
- 代码块「可用」
- 表格
- 内联HTML

```
# 六级标题
#
##
###
####
#####
######

# 斜体文本
*text* _text_

# 外部超链接
[alt](http://xxx.xxx.xx)

# 外链图片
![alt](http://xxx.xxx.xx)

# 行内代码
`code`

# 代码块
```code blocks```

# 表格
|---|---|

# 内联HTML
<div>
</div>
```
> 注：标注为「可用」的语法项B站专栏后端也支持，只是目前暂未开放

如果你考虑将`Markdown`文章发布到B站专栏上，请**谨慎使用**上述语法格式，并考虑替代方案（如：使用图片替换表格）。

## 专有功能

另外，B站也针对自家的专栏文章平台添加了一些**专有**功能，这些选项大多含有B站特色。

- 字号
- 对齐
- 颜色
- 图片分割线
- 站内选项卡

这些选项大多没有合适的`Markdown`语法与之对应，实现方式是通过**内联HTML**。

分析B站专栏文章页面结构，这些专有功能大多是通过`class样式 + 行内css样式`实现，并不具备可移植性，不符合**结构与样式分离**原则。

**此工具并不对这些专有功能提供支持**。

当然，如果你想为你的`Markdown`文章添加上B站专有功能，可以在使用此工具提交后，回到B站专栏**富文本编辑器**中手动修改。

# Configurations（配置选项）

此工具的`json`配置文件非常简单，取得个人用户的`cookies`填入即可，就像这样：

```json
{
  "cookies": ""
}
```
> 注：配置文件结构

更加详细的说明，以下`cookies`必需，有效期大约半月（过期重取）。

```plain
cookies -> "sid"
           "DedeUserID"
           "DedeUserID__ckMd5"
           "bili_jct"
           "SESSDATA"
```
> 注：配置文件详情

# Development（开发相关）

集成该工具开发，需要先`npm install`安装，再导入`bilibili-markdown-tool`模块。

```bash
$ npm install bilibili-markdown-tool --save-dev
```
> 代码清单：`npm`安装开发模块

| API                                          | 说明  |
|:-------------------------------------------- | :---------------------------------------------------------------------------- |
| `startProcess(markdown_path, config_object)` | 上传`Markdown`文件至B站专栏草稿箱，接受`Markdown`文件路径与用户自定义配置选项 |

> 表：模块`API`接口表

# Dependences（依赖相关）

- [marked](https://github.com/markedjs/marked)

> Notes: A markdown parser and compiler. Built for speed.

![marked][marked]

# License（许可协议）

[MIT](./LICENSE)

[bilixmd]:   ./docs/bilixmd.png
[work_flow]: ./docs/work_flow.png
[step2]:     ./docs/step2.png
[step3]:     ./docs/step3.png
[step4_1]:   ./docs/step4_1.png
[step4_2]:   ./docs/step4_2.png
[step4_3]:   ./docs/step4_3.png
[marked]:    ./docs/marked.png

