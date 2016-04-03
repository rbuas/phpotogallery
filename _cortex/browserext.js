browserext = (function ($, Modernizr) {

    var browserext = {
        mq: {
            xxs: function () {
                return Modernizr.mq('(max-width: 449px)');
            },
            xs: function () {
                return Modernizr.mq('(max-width: 767px)');
            },
            fromsm: function () {
                return Modernizr.mq('(min-width: 768px)');
            },
            sm: function () {
                return Modernizr.mq('(min-width: 768px) and (max-width: 980px)');
            },
            tosm: function () {
                return Modernizr.mq('(max-width: 980px)');
            },
            md: function () {
                return Modernizr.mq('(min-width: 981px) and (max-width: 1999px)');
            },
            fromsm: function () {
                return Modernizr.mq('(min-width: 981px)');
            },
            lg: function () {
                return Modernizr.mq('(min-width: 1200px)');
            }
        },
        touch: function () {
            return Modernizr.touchevents;
        },
        mobile: function () {
            return browserext.android()
                || browserext.blackberry()
                || browserext.ios()
                || browserext.operamini()
                || browserext.winmobile();
        },
        webos: function () {
            return navigator.userAgent.match(/webOS/i);
        },
        android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        blackberry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        opera: function() {
            return navigator.userAgent.match(/OPR\/(\d+\.\d+)/i);
        },
        operamini: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        chrome: function () { 
            return navigator.userAgent.match(/Chrome/i);
        },
        firefox: function () {
            return navigator.userAgent.match(/Firefox[\/\s](\d+\.\d+)/i);
        },
        safari: function () { 
            return navigator.userAgent.match(/Safari\/(\d+\.\d+)/i);
        },
        winmobile: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        winos: function () {
            return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i) || navigator.userAgent.match(/Windows Phone/i);
        },
        ios: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        ie: function () {
            return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
        },
        ieversion: function() {
            var match = navigator.userAgent.match(/(?:MSIE |Trident\/.*; rv:)(\d+)/);
            return match ? parseInt(match[1]) : undefined;
        },
        ie8: function () {
            var ieversion = this.ieversion();
            return ieversion && ieversion == 8;
        },
        ie9: function () {
            var ieversion = this.ieversion();
            return ieversion && ieversion == 9;
        },
        lang : function () {
            var lang = window.navigator.userLanguage || window.navigator.language;

            if (lang.indexOf('-') !== -1)
                lang = lang.split('-')[0];

            if (lang.indexOf('_') !== -1)
                lang = lang.split('_')[0];

            lang = lang.toUpperCase();

            return lang;
        },
        injectClasses : function(selector) {
            selector = selector || "html";

            var classes = [];

            var agents = {
                "ie" : this.ie(),
                "ios" : this.ios(),
                "winos" : this.winos(),
                "winmobile" : this.winmobile(), 
                "safari" : this.safari(),
                "firefox" : this.firefox(),
                "chrome" : this.chrome(),
                "operamini" : this.operamini(),
                "agent-opera" : this.opera(),
                "agent-blackberry" : this.blackberry(),
                "agent-android" : this.android(),
                "agent-webos" : this.webos()
            };

            for(var a in agents) {
                if(!agents.hasOwnProperty(a))
                    continue;

                var agent = agents[a];
                if(!agent)
                    continue;

                var agentClass = "agent-" + a;
                var agentVersion = agent.length > 1 ? "-" + agent[1] : "";
                if(agent == "ie") agentVersion = this.ieversion();

                classes.push(agentClass + agentVersion);
            }

            classes.push("lang-" + this.lang());
            classes.push(this.mobile() ? "mobile" : "no-mobile" );
            classes.push(this.touch() ? "touch" : "no-touch" );

            var classesString =  classes.join(" ");
            $(selector).addClass(classesString);
            return classesString;
        },
        urlHash: function (url) {
            url = url || window.location.hash;
            return url.indexOf("#") >= 0 ? url.split("#")[1] : url;
        },
        urlSearch: function (url) {
            url = url || window.location.search;
            return url.indexOf("?") >= 0 ? url.split(/[?#]/)[1] : url;
        },
        urlPath: function(url) {
            var path = url ? url.split(/[?#]/)[0] : window.location.pathname;
            path = (path && path[0] == '/') ? path.substring(1) : path;
            path = (path && path[path.length - 1] == '/') ? path.substring(0, path.length - 1) : path;
            return path;
        },
        breadcrumb: function(url) {
            var path = this.urlPath(url);
            return path != "" ? path.split("/") : [];
        },
        eParam: function(param, str) {
            if(!param || !str)
                return null;

            var params = str.split(/[&]/);
            for (var i = 1; i < params.length; i++) {
                var aParam = params[i].split("=");
                var key = aParam[0];
                var value = decodeURI(aParam[1]);
                if (key == param)
                    return value.indexOf("|") < 0 ? value : value.split("|");
            }
            return null;
        },
        eParams: function(str) {
            var oParams = {};
            if(!str)
                return oParams;

            var params = str.split(/[&]/);
            for (var i = 1; i < params.length; i++) {
                var aParam = params[i].split("=");
                var key = aParam[0];
                var value = decodeURI(aParam[1]);
                oParams[key] = value.indexOf("|") < 0 ? value : value.split("|");
            }

            return oParams;
        },
        eParamsToString: function(eParams) {
            if(!eParams)
                return "";

            var params = [];
            for(var key in eParams) {
                if(!eParams.hasOwnProperty(key))
                    continue;

                var rawValue = eParams[key];
                var value = Array.isArray(rawValue) ? rawValue.join("|") : rawValue;
                params.push(key + "=" + value);
            }
            return params.join("&");
        },
        hashParams: function (url) {
            var hash = this.urlHash(url);

            var hashParams = this.eParams(hash);

            return hashParams;
        },
        searchParams: function (url) {
            var search = this.urlSearch(url);

            var searchParams = this.eParams(search);

            return searchParams;
        },
        param: function (param, url) {
            var hash = this.urlHash(url);
            var search = this.urlSearch(url);

            var hashValue = this.eParam(param, hash);
            var searchValue = this.eParam(param, search);

            return searchValue || hashValue;
        },
        paramHas : function (param, value, url) {
            var paramValue = this.param(param);
            return paramValue && Array.isArray(paramValue) ? paramValue.indexOf(value) >= 0 : paramValue == value;
        },
        paramSet : function (param, value, url, mode) {
            if(!param)
                return;

            mode = mode || "#";
            var urlHash = this.urlHash(url);
            var urlSearch = this.urlSearch(url);
            var urlPath = this.urlPath(url);

            if(mode == "#") {
                var oHash = this.eParams(urlHash);
                oHash[param] = value;
                urlHash = this.eParamsToString(oHash);
            } else if(mode == "?") {
                var oSearch = this.eParams(urlSearch);
                oSearch[param] = value;
                urlSearch = this.eParamsToString(oSearch);
            }
            return urlPath + "?" + urlSearch + "#" + urlHash;
        },
        valueToggle : function(oldValue, toggle) {
            if(!oldValue)
                return toggle || "1";

            if(toggle != null) {
                if(Array.isArray(oldValue)) {
                    oldValue.push(toggle);
                    return oldValue;
                } else {
                    return [toggle];
                } 
            }

            switch(oldValue) {
                case("0") : return "1";
                case("false") : return "true";
                case("true") : return "false";
                case("1") : return "0";
            }
        },
        paramToggle : function (param, value, url, mode) {
            if(!param)
                return;

            mode = mode || "#";
            var urlHash = this.urlHash(url);
            var urlSearch = this.urlSearch(url);
            var urlPath = this.urlPath(url);

            if(mode == "#") {
                var oHash = this.eParams(urlHash);
                oHash[param] = this.valueToggle(oHash[param], value);
                urlHash = this.eParamsToString(oHash);
            } else if(mode == "?") {
                var oSearch = this.eParams(urlSearch);
                oSearch[param] = this.valueToggle(oHash[param], value);
                urlSearch = this.eParamsToString(oSearch);
            }
            return urlPath + "?" + urlSearch + "#" + urlHash;
            
            var values = value ? value.split("|") : null;
            if(toggle) {
                values = values || [];
                var index = values.indexOf(toggle);
                if(index >= 0) 
                    values.splice(index, 1);
                else 
                    values.push(toggle);
                this.param(key, values.join("|"));
            }
            return values;
        },
        elemIsInView: function (element) {
            if(!element)
                return;

            var vpHeight = $(window).height();
            var tolerance = 0.5 * (vpHeight);
            var vpTop = $(window).scrollTop() - tolerance;
            var vpBottom = vpTop + vpHeight + tolerance;

            var eTop = element.offset().top;
            var eHeight = element.offsetHeight || element.height() || 0;
            var eBottom = eTop + eHeight;

            return (eTop > vpTop && eTop < vpBottom) || (eBottom > vpTop && eBottom < vpBottom);
        }
    };

    return browserext;
})(jQuery, Modernizr);