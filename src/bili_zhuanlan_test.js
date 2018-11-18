/*
 * Bilibili zhuanlan Markdown Tool - Test
 * Author: zihengCat
 * Lincese: MIT
 * GitHub: https://github.com/zihengCat/bilibili-zhuanlan-markdown-tool
 */
var crypto = require('crypto');
var js = { "hash": "185717f09620b146", "key": "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCdScM09sZJqFPX7bvmB2y6i08J\nbHsa0v4THafPbJN9NoaZ9Djz1LmeLkVlmWx1DwgHVW+K7LVWT5FV3johacVRuV98\n37+RNntEK6SE82MPcl7fA++dmW2cLlAjsIIkrX+aIvvSGCuUfcWpWFy3YVDqhuHr\nNDjdNcaefJIQHMW+sQIDAQAB\n-----END PUBLIC KEY-----\n" };
// 明文
var data = js["hash"] + 'ilovemikubest1205';
var buffer = new Buffer(data);
var encrypted = crypto.publicEncrypt(js["key"], buffer);
// 密文
var encryptedStr = encrypted.toString('base64');
console.log(encryptedStr);
/*
// 解密
var buffer2 = new Buffer(encryptedStr, 'base64')
var decrypted = crypto.privateDecrypt(
{     key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING // 注意这里的常量值
}, buffer2 )
//console.log(decrypted.toString("utf8")) // 123123
*/
