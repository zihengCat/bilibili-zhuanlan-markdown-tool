"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var http = __importStar(require("http"));
var querystring = __importStar(require("querystring"));
var marked_1 = __importDefault(require("marked"));
var BiliColumnMarkdown = (function () {
    function BiliColumnMarkdown() {
        this.markdownPath = "";
        this.markdownText = "";
        this.HTMLText = "";
        this.cookiesText = "";
        this.userPreferences = {};
        this.localImageURLs = [];
        this.biliImageURLs = [];
        this.formTemplate = {
            "title": "",
            "banner_url": "",
            "content": "",
            "summary": "",
            "words": 0,
            "category": 0,
            "list_id": 0,
            "tid": 0,
            "reprint": 1,
            "tags": "",
            "image_urls": "",
            "origin_image_urls": "",
            "dynamic_intro": "",
            "csrf": ""
        };
    }
    BiliColumnMarkdown.prototype.checkUserPreferences = function (key) {
        if (this.userPreferences[key] !== undefined) {
            return true;
        }
        else {
            return false;
        }
    };
    BiliColumnMarkdown.prototype.startProcess = function (markdownPath, userConfig) {
        this.markdownPath = path.resolve(markdownPath);
        this.markdownText = fs.readFileSync(markdownPath, "utf-8");
        this.userPreferences = userConfig;
        this.userPreferences["csrf"] =
            this.csrfGenerate(userConfig["cookies"]);
        this.HTMLText = this.markdownToHTML(this.markdownText);
        if (this.hasLocalImages(this.HTMLText)) {
            this.postWithImagesForm();
        }
        else {
            this.postPureHTMLForm();
        }
    };
    BiliColumnMarkdown.prototype.postPureHTMLForm = function () {
        this.postRequest(this.HTMLFormGenerate(), "html");
    };
    BiliColumnMarkdown.prototype.postWithImagesForm = function () {
        this.postLocalImages();
    };
    BiliColumnMarkdown.prototype.HTMLFormGenerate = function () {
        var formData = {};
        for (var key in this.formTemplate) {
            formData[key] = this.formTemplate[key];
        }
        if (this.checkUserPreferences("title") == true) {
            formData["title"] = this.userPreferences["title"];
        }
        else {
            var titleName = path.basename(this.markdownPath);
            titleName = titleName.slice(0, titleName.lastIndexOf("."));
            formData["title"] = titleName;
        }
        formData["csrf"] = this.userPreferences["csrf"];
        formData["content"] = this.HTMLText;
        formData["words"] = this.wordsCount(this.HTMLText);
        formData["summary"] = this.summaryGenerate(this.HTMLText);
        return formData;
    };
    BiliColumnMarkdown.prototype.postRequest = function (form, flag) {
        var postOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Content-Length': Buffer.byteLength(querystring.stringify(form)),
                'DNT': '1',
                'Origin': 'https://member.bilibili.com',
                'Referer': 'https://member.bilibili.com/article-text/home',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
                'Cookie': this.userPreferences["cookies"]
            }
        };
        if (flag == "html") {
            postOptions["host"] = "api.bilibili.com";
            postOptions["path"] = "/x/article/creative/draft/addupdate";
            var req = http.request(postOptions, function (res) {
                console.log("[INFO]: StatusCode -> ", res.statusCode);
                res.setEncoding("utf-8");
                res.on("data", function (chunk) {
                    console.log("[INFO]: MessageData -> " + chunk);
                });
                res.on("end", function () {
                    console.log("[INFO]: " + "Operations done successfully! -> " +
                        new Date());
                });
            });
            req.on("error", function (e) {
                console.error("[ERROR]: " + e.message);
            });
            req.write(querystring.stringify(form));
            req.end();
        }
        else if (flag == "image") {
            postOptions["host"] = "member.bilibili.com";
            postOptions["path"] = "/x/web/article/upcover";
            postOptions["headers"]["X-Requested-With"] = "XMLHttpRequest";
            var bReference_1 = this;
            new Promise(function (resolve, reject) {
                var ret = [];
                var imageId = form["cover"].slice(-50, -30);
                var req = http.request(postOptions, function (res) {
                    res.setEncoding("utf-8");
                    res.on("data", function (chunk) {
                        ret.push(chunk);
                    });
                    res.on("end", function () {
                        var retMessage = JSON.parse(ret.toString());
                        if (retMessage["code"] == 0) {
                            resolve({
                                "biliObject": bReference_1,
                                "retMessage": retMessage,
                                "imageId": imageId
                            });
                        }
                        else {
                            console.error("[ERROR]: " + retMessage);
                            throw ("[ERROR]: Image uploads unsuccessful...");
                        }
                    });
                });
                req.on("error", function (e) {
                    console.error("[ERROR]: " + e.message);
                });
                req.write(querystring.stringify(form));
                req.end();
            }).then(function (result) {
                var biliObject = result["biliObject"];
                var imageId = result["imageId"];
                var retMessage = result["retMessage"];
                var biliImageURL = retMessage["data"]["url"];
                biliObject.pushToBiliImageURLs([imageId, biliImageURL]);
                biliObject.replaceLocalImageURLs();
            }, function (reject) {
                console.error("[Reject]: " + reject);
            });
        }
        else {
            throw "[ERROR]: Unsupported Operations!";
        }
    };
    BiliColumnMarkdown.prototype.markdownToHTML = function (markdownText) {
        var myRenderer = new marked_1["default"].Renderer();
        myRenderer.code = function (code, language) {
            return '<figure class="code-box">' +
                '<pre class="language-' + language + '" ' +
                'data-lang="' + language + '">' +
                '<code class="language-${lang}">'.replace("${lang}", language) +
                code + '</code>' +
                '</pre>' +
                '</figure>';
        };
        myRenderer.image = function (href, title, text) {
            return '<figure class="img-box">' +
                '<img src="${imageSrc}" />'.replace("${imageSrc}", href) +
                '<figcaption class="caption">${captionText}</figcaption>'.replace("${captionText}", text) + '</figure>';
        };
        myRenderer.del = function (text) {
            return '<span style="text-decoration: line-through;">' +
                text +
                '</span>';
        };
        myRenderer.hr = function () {
            var biliCutOff = "https://i0.hdslb.com/bfs/article/0117cbba35e51b0bce5f8c2f6a838e8a087e8ee7.png";
            return '<figure class="img-box">' +
                '<img src="${cutoff}" class="cut-off-1" />'.replace("${cutoff}", biliCutOff) +
                '</figure>';
        };
        marked_1["default"].setOptions({
            renderer: myRenderer,
            sanitize: true,
            headerIds: false
        });
        var convertedHTML = marked_1["default"](markdownText);
        return convertedHTML;
    };
    BiliColumnMarkdown.prototype.wordsCount = function (HTMLText) {
        HTMLText = HTMLText.replace(/<\/?[^>]*>/g, "");
        HTMLText = HTMLText.replace(/[ | ]*\n/g, "");
        HTMLText = HTMLText.replace(/\n[\s| | ]*\r/g, "");
        HTMLText = HTMLText.replace(/ /ig, "");
        HTMLText = HTMLText.replace(/\n/g, "");
        HTMLText = HTMLText.replace(/\r\n/g, "");
        return HTMLText.length;
    };
    BiliColumnMarkdown.prototype.summaryGenerate = function (HTMLText) {
        var summaryText = HTMLText.replace(/<\/?[^>]*>/g, "");
        summaryText = summaryText.replace(/\n/g, "");
        summaryText = summaryText.replace(/\r\n/g, "");
        return summaryText.slice(0, 100);
    };
    BiliColumnMarkdown.prototype.csrfGenerate = function (cookiesText) {
        function isVaildCookies(cookies_str) {
            if (cookies_str.match(/sid=/g) == null ||
                cookies_str.match(/DedeUserID=/g) == null ||
                cookies_str.match(/DedeUserID__ckMd5=/g) == null ||
                cookies_str.match(/bili_jct=/g) == null ||
                cookies_str.match(/SESSDATA=/g) == null) {
                throw ("[ERROR]: Invaild `cookies`...");
            }
            return true;
        }
        isVaildCookies(cookiesText);
        var cookies_str = cookiesText.split(";");
        for (var i = 0; i < cookies_str.length; ++i) {
            cookies_str[i] = cookies_str[i].trim();
        }
        var csrf = "";
        for (var i = 0; i < cookies_str.length; ++i) {
            if (cookies_str[i].indexOf("bili_jct=") == 0) {
                csrf = cookies_str[i].slice(cookies_str[i].indexOf("=") + 1);
            }
        }
        return csrf;
    };
    BiliColumnMarkdown.prototype.hasLocalImages = function (HTMLText) {
        var hasImage = HTMLText.match(/src=.* \/>/g);
        if (hasImage == null) {
            return false;
        }
        else {
            return true;
        }
    };
    BiliColumnMarkdown.prototype.postLocalImages = function () {
        function checkLocally(src) {
            if (src.indexOf("http") == 0 ||
                src.indexOf("https") == 0) {
                return false;
            }
            else {
                return true;
            }
        }
        var imagesArr = this.HTMLText.match(/src=.* \/>/g);
        if (imagesArr == null) {
            return;
        }
        var localImagesArr = Array();
        for (var i = 0; i < imagesArr.length; ++i) {
            var imageURL = imagesArr[i].slice(imagesArr[i].indexOf('"') + 1, imagesArr[i].lastIndexOf('"'));
            if (checkLocally(imageURL) == true) {
                localImagesArr.push(imageURL);
            }
        }
        for (var i = 0; i < localImagesArr.length; ++i) {
            var imageFullPath = path.resolve(path.dirname(this.markdownPath), localImagesArr[i]);
            var imageForm = this.imagesFormGenerate(imageFullPath);
            var imageId = imageForm["cover"].slice(-50, -30);
            this.localImageURLs.push([imageId, localImagesArr[i]]);
            this.postRequest(imageForm, "image");
        }
    };
    BiliColumnMarkdown.prototype.imagesFormGenerate = function (imageURL, csrf) {
        if (csrf === void 0) { csrf = this.userPreferences["csrf"]; }
        function imageToBase64(imageSource) {
            if (imageSource.indexOf('http') != 0) {
                var imagePrefix = "";
                var imageData = fs.readFileSync(imageSource);
                var imageBase64 = imageData.toString("base64");
                if (path.extname(imageSource) == ".png" ||
                    path.extname(imageSource) == ".PNG") {
                    imagePrefix = "data:image/png;base64,";
                }
                else if (path.extname(imageSource) == ".jpg" ||
                    path.extname(imageSource) == ".jpeg" ||
                    path.extname(imageSource) == ".JPG") {
                    imagePrefix = "data:image/jpeg;base64,";
                }
                else if (path.extname(imageSource) == ".gif") {
                    imagePrefix = "data:image/gif;base64,";
                }
                return imagePrefix + imageBase64;
            }
            else {
                throw "[ERROR]: Unsupported image type!";
            }
        }
        var imagePostForm = {
            "cover": imageToBase64(imageURL),
            "csrf": csrf
        };
        return imagePostForm;
    };
    BiliColumnMarkdown.prototype.pushToBiliImageURLs = function (aPair) {
        this.biliImageURLs.push(aPair);
    };
    BiliColumnMarkdown.prototype.replaceLocalImageURLs = function () {
        function findLocalImageURL(imageId, imageURLs) {
            var retLocalImageURL = "";
            for (var i = 0; i < imageURLs.length; ++i) {
                var e = imageURLs[i];
                if (e[0] === imageId) {
                    retLocalImageURL = e[1];
                }
            }
            if (retLocalImageURL === "") {
                throw "[ERROR]: Something wrong when processing local images...";
            }
            return retLocalImageURL;
        }
        if (this.localImageURLs.length != 0 &&
            this.biliImageURLs.length != 0 &&
            (this.biliImageURLs.length ==
                this.localImageURLs.length)) {
            for (var i = 0; i < this.biliImageURLs.length; ++i) {
                var imageId = this.biliImageURLs[i][0];
                var biliImageURL = this.biliImageURLs[i][1];
                var localImageURL = findLocalImageURL(imageId, this.localImageURLs);
                this.HTMLText =
                    this.HTMLText.replace(new RegExp(localImageURL, "gm"), biliImageURL);
                console.log("[INFO]: Image `" +
                    localImageURL + "` " +
                    "uploads successful!");
            }
            this.postRequest(this.HTMLFormGenerate(), "html");
        }
        else {
        }
    };
    return BiliColumnMarkdown;
}());
exports.BiliColumnMarkdown = BiliColumnMarkdown;
