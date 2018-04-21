const fs = require('fs');
var preferencesLoader =  {
    get_csrf: function (cookies_str) {
        cookies_str = cookies_str.split(';');
        for(var i = 0; i < cookies_str.length; i++) {
            cookies_str[i] = cookies_str[i].trim();
        }
        var csrf = "";
        for(var i = 0; i < cookies_str.length; i++) {
            if(cookies_str[i].indexOf("bili_jct=") == 0) {
                csrf = cookies_str[i].slice(cookies_str[i].indexOf("=") + 1);
            }
        }
        return csrf;
    },
    startProcess: function (preferences_path) {
        var pform = fs.readFileSync(preferences_path, 'utf-8');
        pform = JSON.parse(pform);
        pform["csrf"] = this.get_csrf(pform["cookies"]);
        return pform;
    }
}

module.exports = preferencesLoader;

