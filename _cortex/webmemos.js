/////////////////////////////////////////////////////////////////
// WebMemos extends Cortex
// author: Rodrigo Buas - rodrigobuas@gmail.com - 20160409
/////////////////////////////////////////////////////////////////
WebMemos = (function ($, tracer, Cortex, browserext, parserext) {

    function WebMemos (options) {
        var _this = this;
        this.ready = false;

        var defaultOptions = {
            version : "201603300000",
            rootNote : "memos",
            module : "WebMemos",
            defaultPage : "home",
            userRedirectOnLogin : true,
            config : {
                LANGUAGES : ["PT","FR","EN","ES"],
                "MENU" : []
            }
        };

        this.options = $.extend({}, defaultOptions, options);
        this.memocache = {};

        Cortex.call(this, this.options);

        this.updateData(Cortex.DATA.MAP, this.options.routes);
        this.updateData(Cortex.DATA.CONFIG, this.options.config);

        this.ready = true;
    };

    WebMemos.prototype = $.extend({}, Cortex.prototype, {

        access : function(url) {
            var _this = this;
            url = url || window.location.hash;

            var currentuser = this.userCurrent();
            var slug;
            var params = {};
            slug = browserext.urlHash(url);
            slug = (slug && slug.indexOf('/') == 0) ? slug.substring(1) : slug;
            if(!slug) {
                slug = currentuser && currentuser.uid ? currentuser.uid : "";
            }
            var breadcrumb = browserext.breadcrumb(slug);
            params.memouser = (breadcrumb && breadcrumb.length > 0) ? breadcrumb[0] : null;
            params.memoid = this.memoGetId(breadcrumb);

            var inmemo = breadcrumb && breadcrumb.length > 1;
            var reconnect = this.firstaccess || slug != this.get(Cortex.DATA.SLUG);
            if(!reconnect) {
                _this.updateData(Cortex.DATA.PARAMS, params);
                return Promise.resolve();
            }

            return this.connect(slug, "N").then(
                function success (response) {
                    lazyAction(function() {
                        var error = _this.catchError(response);
                        if(!error) {
                            _this.updateData(Cortex.DATA.SLUG, slug || _this.options.defaultPage);
                        }
                        _this.updateData(Cortex.DATA.PARAMS, params);
                        _this.firstaccess = false;
                    })
                },
                function error (error) { _this.catchError({status:"error", error:"connection error"}) }
            );
        }

    });
    Cortex.prototype.constructor = Cortex;

    return WebMemos;
})(jQuery, tracer, Cortex, browserext, parserext);