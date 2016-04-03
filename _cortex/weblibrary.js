/////////////////////////////////////////////////////////////////
// WebLibrary extends Cortex
// author: Rodrigo Buas - rodrigobuas@gmail.com - 20150621
/////////////////////////////////////////////////////////////////
WebLibrary = (function ($, tracer, ClientData, Synapse) {

    function WebLibrary (options) {
        var _this = this;
        this.ready = false;

        var defaultOptions = {
            version : "201603080830",
            defaultPage : "home",
            config : "/config.jsc",
            sitemap : "/sitemap.jsc",
            common : "/common.res",
            albumsPath : "/RBUAS",
            librarySkeleton : "library",
            albumSkeleton : "album",
            albumContent : "content",
            module : "WebLibrary"
        };

        this.options = $.extend({}, defaultOptions, options);

        Cortex.call(this, this.options);

        this.ready = true;
    };

    WebLibrary.prototype = $.extend({}, Cortex.prototype, {
        stockAlbum : function (slug, album) {
            if(!slug || !album)
                return;

            if(!this.data[Cortex.DATA.ALBUM]) this.data[Cortex.DATA.ALBUM] = {};

            this.data[Cortex.DATA.ALBUM][slug] = album;
            this.broadcast(Cortex.DATA.ALBUM);
            return album;
        },

        library : function(filter) {
            var _this = this;
            return this.synapse("library", [filter]).then(
                function success (response) { 
                    if(_this.catchError(response)) return;
                    _this.updateData(Cortex.DATA.LIBRARY, response.library);
                },
                function error (error) { return _this.error(error); }
            );
        },

        album : function(slug) {
            var catalog = this.catalog();
            if(!slug || !catalog[slug])
                return Promise.resolve();

            var _this = this;
            var albums = this.get(Cortex.DATA.ALBUM);
            var album = (albums && albums[slug]) ? albums[slug] : null;
            if(album) return Promise.resolve(album);

            return this.synapse("album", [slug]).then(
                function success (response) {
                    if(_this.catchError(response)) return;
                    var stockalbum = $.extend(response.album, {INDEX:response.albumindex});
                    return _this.stockAlbum(slug, stockalbum);
                },
                function error (error) { return _this.error(error); }
            );
        },



        ////////////
        // ADMIN
        ///////

        buildLibrary : function() {
            var _this = this;
            return this.synapse("buildLibrary").then(
                function success (response) { if(_this.catchError(response)) return; },
                function error (error) { return _this.error(error); }
            );
        },

        buildAlbum : function(slug) {
            var _this = this;
            return this.synapse("buildAlbum", [slug]).then(
                function success (response) { if(_this.catchError(response)) return; },
                function error (error) { return _this.error(error); }
            );
        }
    });
    Cortex.prototype.constructor = Cortex;


    return WebLibrary;
})(jQuery, tracer, ClientData, Synapse);