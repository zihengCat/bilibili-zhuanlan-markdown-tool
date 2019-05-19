/**
 * Bilibili zhuanlan Markdown-Tool - Core
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
/* Standard Libs */
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import * as http from "http";
import * as https from "https";
import * as querystring from "querystring";
/* Third-Part Libs */
import marked from "marked";
/**
 * Core Class
 */
class BiliColumnMarkdown {
    /**
     * 本地 Markdown 路径
     */
    private markdownPath: string =  "";
    /**
     * 原始 Markdown 文本
     */
    private markdownText: string = "";
    /**
     * 转换 HTML 文本
     */
    private HTMLText: string = "";
    /**
     * 用户认证 Cookies
     */
    private cookiesText: string = "";
    /**
     * 用户偏好设置选项
     */
    private userPreferences: object = {
    };
    /**
     * 本地图片地址暂存区（Array of Tuple）
     * ```
     * [
     *     [ imageId_1, localImageURL_1 ],
     *     [ imageId_2, localImageURL_2 ],
     *     ...,
     *     [ imageId_n, localImageURL_n ]
     * ]
     * ```
     */
    private localImageURLs: Array<[string, string]> = [
    ];
    /**
     * B站上传图片地址暂存区（Array of Tuple）
     * ```
     * [
     *     [ imageId_1, biliImageURL_1 ],
     *     [ imageId_2, biliImageURL_2 ],
     *     ...,
     *     [ imageId_n, biliImageURL_n ]
     * ]
     * ```
     */
    private biliImageURLs: Array<[string, string]> = [
    ];
    /**
     * 专栏表单数据结构
     */
    private formTemplate: object = {
        "title": "",       /* 文章标题（自动生成） */
        "banner_url": "",  /* 文章头图（可为空） */
        "content": "",     /* 文章 HTML 内容（自动生成） */
        "summary": "",     /* 文章小结（自动生成） */
        "words": 0,        /* 文章字数（自动生成） */
        "category": 0,     /* 文章分类 */
        "list_id": 0,      /* 文章文集（轻小说） */
        "tid": 0,          /* 不明字段 */
        "reprint": 1,      /* 可否复制（必需[0, 1]） */
        "tags": "",        /* 文章标签 */
        "image_urls": "",
        "origin_image_urls": "",
        "dynamic_intro": "", /* 文章推荐语（可为空） */
        // "aid": "",      /* 可有可无 => 有: 修改草稿, 无: 新增草稿 */
        "csrf": ""         /* 跨域认证信息（自动生成） */
    }
    /**
     * 构造函数
     */
    public constructor() {
        // ...
    }
    /**
     * 功能函数: 检查用户是否配置了自定义参数
     * @param key 
     * @returns `boolean`
     */
    private checkUserPreferences(key: string): boolean {
        if (this.userPreferences[key] !== undefined) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * 处理流程: 取得 MD 文档与配置选项 -> Markdown 转换 HTML ->
     *         上传本地图片取得B站外链 -> 替换本地图片地址为B站外链地址 ->
     *         合成表单发送更新
     * @param markdownPath
     * @param userConfig
     * @returns void
     */
    public startProcess(markdownPath: string, userConfig: object): void {
        /* 解析 Markdown 文档 <绝对路径> */
        this.markdownPath = path.resolve(markdownPath);
        /* 读取 Markdown 文本内容 */
        this.markdownText = fs.readFileSync(markdownPath, "utf-8");
        /* 读取用户配置信息 */
        this.userPreferences = userConfig;
        /* 计算 CSRF 值 */
        this.userPreferences["csrf"] =
            this.csrfGenerate(userConfig["cookies"]);
        /* 转换 Markdown 文档为 HTML 文档 */
        this.HTMLText = this.markdownToHTML(this.markdownText);
        if (this.hasLocalImages(this.HTMLText)) {
            this.postWithImagesForm();
        } else {
            this.postPureHTMLForm();
        }
    }
    /* 提交 HTML 表单 */
    private postPureHTMLForm(): void {
        this.postRequest(
            this.HTMLFormGenerate(),
            "html"
        );
    }
    private postWithImagesForm(): void {
        this.postLocalImages();
    }
    /* 使用转换后数据生成 HTML 发送表单 */
    private HTMLFormGenerate(): object {
        let formData: object = {
        };
        /* 深拷贝模版数据 */
        for (let key in this.formTemplate) {
            formData[key] = this.formTemplate[key];
        }
        /* 用户自定义配置 */
        if (this.checkUserPreferences("title") == true) {
            /* 使用用户自定义标题 */
            formData["title"] = this.userPreferences["title"];
        } else {
            /* 使用默认标题 */
            let titleName: string = path.basename(this.markdownPath);
            titleName = titleName.slice(
                0, titleName.lastIndexOf(".")
            );
            formData["title"] = titleName;
        }
        /* 覆写 CSRF 值 */
        formData["csrf"]  = this.userPreferences["csrf"];
        /* 覆写相关信息 */
        formData["content"] = this.HTMLText;
        formData["words"]   = this.wordsCount(this.HTMLText);
        formData["summary"] = this.summaryGenerate(this.HTMLText);
        /* 返回合成表单数据 */
        return formData;
    }
    /**
     * 核心函数: 提交表单数据
     * @param form
     * @param flag 
     */
    private postRequest(form: any, flag: string): void {
        let postOptions: object = {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                /* 计算文档长度 */
                'Content-Length': Buffer.byteLength(querystring.stringify(form)),
                'DNT': '1',
                'Origin': 'https://member.bilibili.com',
                /* 构建 Referer 头 */
                'Referer': 'https://member.bilibili.com/article-text/home',
                /*
                'Referer': 'https://member.bilibili.com/article-text/home?aid=' +
                            this.userPreferences["aid"],
                */
                /* 默认 UA */
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
                /* 构建 Cookie */
                'Cookie': this.userPreferences["cookies"]
            }
        };
        if (flag == "html") {
            //console.log(form);
            /* 添加提交地址 */
            postOptions["host"] = "api.bilibili.com";
            postOptions["path"] = "/x/article/creative/draft/addupdate";
            /* 发送 HTML 表单 */
            let req: http.ClientRequest = 
            http.request(
                postOptions,
                function(res: http.IncomingMessage): void {
                    console.log("[INFO]: StatusCode -> ", res.statusCode);
                    //console.log("Headers: ", JSON.stringify(res.headers));
                    res.setEncoding("utf-8");
                    res.on("data", function(chunk: any): void {
                        console.log("[INFO]: MessageData -> " + chunk);
                    });
                    res.on("end", function(): void {
                        console.log(
                            "[INFO]: " + "Operations done successfully! -> " +
                            new Date()
                        );
                    });
                });
            req.on("error", function(e: Error): void {
                console.error("[ERROR]: " + e.message);
            });
            /* 序列化表单数据 */
            req.write(
                querystring.stringify(form)
            );
            req.end();
        } else if (flag == "image") {
            /* 图片提交头 */
            postOptions["host"] = "member.bilibili.com";
            postOptions["path"] = "/x/web/article/upcover";
            postOptions["headers"]["X-Requested-With"] = "XMLHttpRequest";
            /** NOTE:
             *  Keep a reference of this instance.
             */
            let bReference: BiliColumnMarkdown = this;
            /* --------------- */
            /* Promise Execute */
            /* ----------------*/
            new Promise(function(resolve, reject) {
                /**
                 * [
                 *   '{"code": 0, "message": "0"}',
                 *   '{"code": 0, "message": "1"}'
                 * ]
                 */
                let ret: any[] = [];
                /** 
                 * cover -> Image Base64
                 */
                let imageId = form["cover"].slice(-50, -30);
                let req: http.ClientRequest = 
                http.request(
                    postOptions,
                    function(res: http.IncomingMessage): void {
                        //console.log("[INFO]: StatusCode -> ", res.statusCode);
                        //console.log("Headers: ", JSON.stringify(res.headers));
                        res.setEncoding("utf-8");
                        res.on("data", function(chunk: any): void {
                            //console.log("[INFO]: MessageData -> " + chunk);
                            ret.push(chunk);
                        });
                        res.on("end", function(): void {
                        /*
                        {
                            "code": 0,
                            "message": "0",
                            "ttl": 1,
                            "data": {
                                "size": 123456,
                                "url":"http://i0.hdslb.com/bfs/article/xxx"
                            }
                        }
                        */
                            let retMessage: object = JSON.parse(ret.toString());
                            if (retMessage["code"] == 0) {
                                /* 返回格式化字符串 */
                                resolve({
                                    "biliObject": bReference,
                                    "retMessage": retMessage,
                                    "imageId": imageId
                                });
                            } else {
                                console.error("[ERROR]: " + retMessage);
                                throw("[ERROR]: Image uploads unsuccessful...");
                            }
                        });
                    });
                req.on("error", function(e: Error): void {
                    console.error("[ERROR]: " + e.message);
                });
                /* 序列化表单数据 */
                req.write(
                    querystring.stringify(form)
                );
                req.end();
            }).then(
            function(result) {
                //console.log("[Resolve]: " + result);
                let biliObject: BiliColumnMarkdown = result["biliObject"];
                let imageId: string =  result["imageId"];
                let retMessage: object = result["retMessage"];
                let biliImageURL: string = retMessage["data"]["url"];
                //console.log(retMessage);
                biliObject.pushToBiliImageURLs(
                    [imageId, biliImageURL]
                );
                biliObject.replaceLocalImageURLs();
            },
            function(reject) {
                console.error("[Reject]: " + reject);
            });
        } else {
            throw "[ERROR]: Unsupported Operations!";
        }
    }
    /**
     * 核心函数: `Markdown` 转 `Bilibili Compatible HTML`。
     */
    private markdownToHTML(markdownText: string): string {
        /* 自定义生成器 */
        let myRenderer: marked.Renderer = new marked.Renderer();
        /* 覆写`标题`生成规则「弃用」=>
          `marked v0.4.0` 已支持`headerIds`选项
         */
        /*
        myRenderer.heading = function (text, level) {
            return '<h' + level + '>' + text +
                   '</h' + level + '>';
        }
        */
        /* 覆写`代码块`生成规则 */
        myRenderer.code = function(
            code: string,
            language: string
        ): string {
            return '<figure class="code-box">' +
            '<pre class="language-' + language + '" ' +
            'data-lang="' + language + '">' +
            '<code class="language-${lang}">'.replace("${lang}", language) +
            code + '</code>' +
            '</pre>' +
            '</figure>';
        }
        /* 覆写`图片`生成规则 */
        myRenderer.image = function(
            href: string,
            title: string,
            text: string
        ): string {
            return '<figure class="img-box">' +
            '<img src="${imageSrc}" />'.replace(
                "${imageSrc}", href
            ) +
            '<figcaption class="caption">${captionText}</figcaption>'.replace(
                "${captionText}", text
            ) + '</figure>';
        }
        /* 覆写`删除线`生成规则 */
        myRenderer.del = function(text: string): string {
            return '<span style="text-decoration: line-through;">' +
                text +
            '</span>';
        }
        /* 覆写`分隔线`生成规则 */
        myRenderer.hr = function(): string {
            /* hardcode here */
            let biliCutOff: string = 
            "https://i0.hdslb.com/bfs/article/0117cbba35e51b0bce5f8c2f6a838e8a087e8ee7.png";
            return '<figure class="img-box">' +
            '<img src="${cutoff}" class="cut-off-1" />'.replace("${cutoff}", biliCutOff) +
            '</figure>'
        }
        /* 生成器配置选项 */
        marked.setOptions({
            renderer: myRenderer, /* 使用自定义生成器 */
            sanitize: true,       /* 内联 HTML 功能: 禁用 */
            headerIds: false,     /* 自动生成`headerIds`功能: 禁用 */
            /* 是否启用`highlight.js`代码高亮 */
            /*
            highlight: function (code) {
                return highlight.highlightAuto(code).value;
            }
             */
        });
        /* 返回转换后 HTML 文本 */
        let convertedHTML: string = marked(markdownText);
        return convertedHTML;
    }
    /**
     *  核心函数: 文本计数
     */
    private wordsCount(HTMLText: string): number {
        /* 去除 HTML <tags> */
        HTMLText = HTMLText.replace(/<\/?[^>]*>/g, "");
        /* 去除行末空白符 */
        HTMLText = HTMLText.replace(/[ | ]*\n/g, "");
        /* 去除多余空白行 */
        HTMLText = HTMLText.replace(/\n[\s| | ]*\r/g, "");
        /* 去除所有空格符 */
        HTMLText = HTMLText.replace(/ /ig, "");
        /* 去除所有换行符 */
        HTMLText = HTMLText.replace(/\n/g, "");
        HTMLText = HTMLText.replace(/\r\n/g, "");
        /* 返回处理后 HTML 文本长度 */
        return HTMLText.length;
    }
    /**
     * 核心函数: 获取文章小结
     */
    private summaryGenerate(HTMLText: string): string {
        /* 去除 HTML <tags> */
        let summaryText: string = HTMLText.replace(/<\/?[^>]*>/g, "");
        /* 去除所有换行符 */
        summaryText = summaryText.replace(/\n/g, "");
        summaryText = summaryText.replace(/\r\n/g, "");
        /* 取前 100 字符 */
        return summaryText.slice(0, 100);
    }
    /**
     * 功能函数: 从 Cookie 中获取 CSRF 信息
     */
    private csrfGenerate(cookiesText: string): string {
        function isVaildCookies(cookies_str: string): boolean {
            /* 检查 Cookies 是否包含关键字段 */
            if (cookies_str.match(/sid=/g) == null ||
                cookies_str.match(/DedeUserID=/g) == null ||
                cookies_str.match(/DedeUserID__ckMd5=/g) == null ||
                cookies_str.match(/bili_jct=/g) == null ||
                cookies_str.match(/SESSDATA=/g) == null ) {
                    throw("[ERROR]: Invaild `cookies`...");
            }
            return true;
        }
        isVaildCookies(cookiesText);
        let cookies_str: string[] = cookiesText.split(";");
        for (let i: number = 0; i < cookies_str.length; ++i) {
            cookies_str[i] = cookies_str[i].trim();
        }
        let csrf: string = "";
        for (let i: number = 0; i < cookies_str.length; ++i) {
            /* 关键字段 -> bili_jct */
            if (cookies_str[i].indexOf("bili_jct=") == 0) {
                csrf = cookies_str[i].slice(
                    cookies_str[i].indexOf("=") + 1
                );
            }
        }
        return csrf;
    }
    /**
     * 功能函数: 检测 HTML 文档中是否包含本地图片
     * @param HTMLText 
     */
    private hasLocalImages(HTMLText: string): boolean {
        let hasImage: RegExpMatchArray | null = HTMLText.match(/src=.* \/>/g);
        if (hasImage == null) {
            return false;
        } else {
            return true;
        }
    }
    /* 处理 HTML 中本地图片 */
    private postLocalImages() {
        function checkLocally(src: string) {
            if (src.indexOf("http") == 0 ||
                src.indexOf("https") == 0) {
                /* B站不支持外链图片，
                   关闭外链图片功能 */
                //throw("[ERROR]: Unsupported outer-linking images...");
                return false;
            } else {
                return true;
            }
        }
        /* 获取所有图片地址
           格式: <img src="%src" /> */
        let imagesArr: RegExpMatchArray | null = this.HTMLText.match(/src=.* \/>/g);
        /* 优化项 -> 如果不存在本地图片, 可直接返回 */
        if (imagesArr == null) {
            return;
        }
        let localImagesArr: string[] = Array<string>();
        /* 找到所有本地图片 URL */
        for (let i: number = 0; i < imagesArr.length; ++i) {
            let imageURL: string = imagesArr[i].slice(
                imagesArr[i].indexOf('"') + 1,
                imagesArr[i].lastIndexOf('"')
            );
            if (checkLocally(imageURL) == true) {
                localImagesArr.push(imageURL);
            }
        }
        for (let i: number = 0; i < localImagesArr.length; ++i) {
            /* 使用图片绝对路径 */
            let imageFullPath: string = path.resolve(
                path.dirname(this.markdownPath),
                localImagesArr[i]
            );
            /* 生成图片上传表单 */
            let imageForm: object = this.imagesFormGenerate(imageFullPath);
            /* 取图片特征值作图片ID */
            let imageId: string = imageForm["cover"].slice(-50, -30);
            /* 图片地址存入本地图片暂存区 */
            this.localImageURLs.push(
                [imageId, localImagesArr[i]]
            );
            /* 上传图片至B站服务器 */
            this.postRequest(imageForm, "image");
        }
    }
    /**
     * 生成图片发送表单
     * @param imageURL 
     * @param csrf 
     * @returns Image Form Object
     */
    private imagesFormGenerate(
        imageURL: string,
        csrf: string = this.userPreferences["csrf"]
    ): object {
        /* 功能函数: 图片转 Base64 编码 */
        function imageToBase64(imageSource: string): string {
        /* ------------------------------- *
         *        图片 Base64 格式头         *
         * =============================== *
         * PNG  -> data:image/png;base64,  *
         * JPEG -> data:image/jpeg;base64, *
         * GIF  -> data:image/gif;base64,  *
         * ------------------------------- */
            if (imageSource.indexOf('http') != 0) {
                let imagePrefix: string = "";
                let imageData: Buffer = fs.readFileSync(imageSource);
                let imageBase64 = imageData.toString("base64");
                if (path.extname(imageSource) == ".png" ||
                    path.extname(imageSource) == ".PNG") {
                    imagePrefix = "data:image/png;base64,";
                } else if (path.extname(imageSource) == ".jpg" ||
                           path.extname(imageSource) == ".jpeg"||
                           path.extname(imageSource) == ".JPG") {
                    imagePrefix = "data:image/jpeg;base64,";
                } else if (path.extname(imageSource) == ".gif") {
                    imagePrefix = "data:image/gif;base64,";
                }
                return  imagePrefix + imageBase64;
            } else {
                throw "[ERROR]: Unsupported image type!"
            }
        }
        /* 构建图片上传表单返回 */
        let imagePostForm: object = {
            "cover": imageToBase64(imageURL),
            "csrf":  csrf
        };
        return imagePostForm;
    }
    private pushToBiliImageURLs(aPair: [string, string]): void {
        this.biliImageURLs.push(aPair);
    }
    /**
     * 将 HTML 中的本地图片地址替换为B站图片地址
     */
    private replaceLocalImageURLs(): void {
        function findLocalImageURL(
            imageId: string,
            imageURLs: Array<[string, string]>
        ): string {
            let retLocalImageURL = "";
            for (let i: number = 0; i < imageURLs.length; ++i) {
                let e: [string, string] = imageURLs[i];
                if (e[0] === imageId) {
                    retLocalImageURL = e[1];
                }
            }
            if (retLocalImageURL === "") {
                throw "[ERROR]: Something wrong when processing local images...";
            }
            return retLocalImageURL;
        }
        /* 本地图片已全部上传完成 */
        if (this.localImageURLs.length != 0 &&
            this.biliImageURLs.length != 0 &&
           (this.biliImageURLs.length ==
            this.localImageURLs.length)) {
            /* 替换图片链接地址 */
            for (let i: number = 0; i < this.biliImageURLs.length; ++i) {
                let imageId: string = this.biliImageURLs[i][0];
                let biliImageURL: string = this.biliImageURLs[i][1];
                let localImageURL: string = findLocalImageURL(
                    imageId, this.localImageURLs
                );
                //console.log(localImageURL);
                //console.log(biliImageURL);
                //console.log(this.HTMLText);
                this.HTMLText =
                this.HTMLText.replace(
                    new RegExp(localImageURL, "gm"),
                    biliImageURL
                );
                //console.log(this.HTMLText);
                console.log(
                    "[INFO]: Image `" +
                    localImageURL + "` " +
                    "uploads successful!"
                );
            }
            /* 一次性全部提交 */
            this.postRequest(this.HTMLFormGenerate() ,"html");
        } else {
            /* 本地图片未全部上传完成 */
            //console.log("Do nothing");
        }
    }
}
export { BiliColumnMarkdown };