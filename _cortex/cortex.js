/////////////////////////////////////////////////////////////////
// Cortex extends ClientData
// author: Rodrigo Buas - rodrigobuas@gmail.com - 20150621
/////////////////////////////////////////////////////////////////
Cortex = (function ($, tracer, ClientData, Synapse) {

    function Cortex (options) {
        var _this = this;
        this.ready = false;
        this.firstaccess = true;

        var defaultOptions = {
            version : "201603080830",
            defaultPage : "home",
            config : null,
            sitemap : null,
            common : null,
            root : "",
            rootNote : "NOTES",
            skeletonPath : "/_skeleton",
            skinPath : "/mediaskin",
            memoryPath : '/_memory',
            contentExt : ".html",
            dependencies : ['ngRoute', 'ngSanitize', 'ngTouch'],
            module : "CortexModule",
            asyncMode:true,
            Synapse : null,
            user : null,
            persistentData : [Cortex.DATA.USER]
        };

        this.options = $.extend({}, defaultOptions, options);
        this.connections = {};

        var _synapse = this.options.synapse || new Synapse({asyncMode:this.options.asyncMode});
        this.synapse = function (synapse, args) {
            if(!synapse)
                return Promise.reject("Cortex::synapse: missing params.");

            if(!_synapse[synapse])
                return Promise.reject("Cortex::synapse: synapse not found.");

            return _synapse[synapse].apply(_synapse, args);
        }
        this.waiting = function () {
            //return the number of request
            return _synapse.waiting;
        }
        this.inconnection = function () {
            //return waiting connection flag
            return this.inconnection;
        }

        ClientData.call(this, this.options);

        startModule(this);

        browserext.injectClasses();

        _this.updateData(Cortex.DATA.LANG, browserext.lang() || _this.options[Cortex.DATA.LANG]);
        _this.updateData(Cortex.DATA.USER, _this.options[Cortex.DATA.USER] || {});

        _this.ready = true;
    };

    Cortex.DATA = {
        USER : "user",
        LANG : "lang",
        SLUG : "slug",
        PARAMS : "params",
        ROUTE : "route",
        MAP : "map",
        CONFIG : "config",
        COMMON : "common",
        ERROR : "error",
        NOTE : "note",
        NOTELIST : "notelist",
        LIBRARY : "library",
        ALBUM : "album"
    };

    Cortex.prototype = $.extend({}, ClientData.prototype, {
        broadcast : function (event) {
            if(!this.root || !this.ready)
                return;

            tracer.comm('Cortex::broadcast: ', event);
            this.root.$broadcast(event);
        },

        controller : function (controllerId, controller) {
            //create a controller linket to the module
            return this.module.controller(controllerId, controller);
        },

        directive : function (directiveId, controller) {
            //create a controller linket to the module
            return this.module.directive(directiveId, controller);
        },

        translate : function (token, forcelang) {
            if(!token)
                return;

            var lang = forcelang || this.get(Cortex.DATA.LANG) || "EN";

            if(typeof(token) === "object") {
                return token[lang] || token[Object.keys(token)[0]];
            }

            var common = this.get(Cortex.DATA.COMMON);
            var obj = common ? common[token] : null;
            return obj ? obj[lang] : token;
        },

        config : function (key) {
            var config = this.get(Cortex.DATA.CONFIG);

            //get all
            if(!key || !config)
                return config;

            //get item
            return config[key];
        },

        slugbase : function(slug) {
            var slug = slug || "";

            var map = this.get(Cortex.DATA.MAP);
            if(!map)
                return;

            if(map[slug])
                return slug;

            for(r in map) {
                var routeInfo = map[r];
                if(routeInfo && routeInfo.ALIAS && routeInfo.ALIAS.indexOf(slug) >= 0) {
                    return r;
                }
            }
            return;
        },

        catchError: function (response) {
            if(!response || !response.status) {
                var error = "Missing response status.";
                this.error(error);
                return error;
            }

            if(response.status != "success") {
                var error = response.error || response.status_message || "";
                this.error("Response status error : " + error);
                return error;
            }
        },

        loadResource: function ( key, filename ) {
            if(!filename)
                return Promise.resolve();

            var _this = this;
            return this.synapse("load", [filename]).then(
                function success (data) { return _this.updateData(key, data); },
                function error (error) { return _this.error(error); }
            );
        },

        update : function (tab) {
            if(!tab)
                return;

            var _this = this;
            for(key in tab) {
                _this.updateData(key, tab[key]);
            }
        },

        updateData : function (key, value) {
            if( !isData(key) )
                return;

            this.set(key, value);
            this.broadcast(key);
            return value;
        },

        error : function (error) {
            if(error == null)
                return this.errors;

            if(!this.errors) this.errors = [];
            this.errors.push(error);

            this.broadcast(Cortex.DATA.ERROR);
            return error;
        },

        skin : function (skin) {
            var version = this.options.version ? "?" + this.options.version : "";
            return this.options.root + this.options.skinPath + "/" + skin + version;
        },

        skeleton : function (skeleton, ext) {
            var ext = ext ? ext : "html";
            var version = this.options.version ? "?" + this.options.version : "";

            if(typeof(skeleton) == "string")
                return this.options.root + this.options.skeletonPath + '/' + skeleton + "." + ext + version;

            var list = {};
            for(key in skeleton) {
                var file = skeleton[key];
                list[key] = this.options.root + this.options.skeletonPath + '/' + file + "." + ext + version;
            }
            return list;
        },

        route : function (slug) {
            if(!slug)
                return this.get(Cortex.DATA.ROUTE);

            var map = this.get(Cortex.DATA.MAP);
            if(!map)
                return;

            var route = map[slug];
            if(!route) {
                for(r in map) {
                    var routeInfo = map[r];
                    if(routeInfo && routeInfo.ALIAS && routeInfo.ALIAS.indexOf(slug) >= 0) {
                        route = routeInfo;
                        break;
                    }
                }
            }
            return route;
        },

        routeAccess : function (slug) {
            var route = this.route(slug);
            if(!route)
                return false;

            if(!route.PRIVATE)
                return true;

            var user = this.get(Cortex.DATA.USER);
            if(user == null)
                return false;

            var config = this.get(Cortex.DATA.CONFIG);
            var master = config ? config.MASTER : null;
            if(user.email == master)
                return true;

            return this.userHasPassport(user, slug);
        },

        routeSkeleton : function (slug, ext) {
            var ext = ext ? ext : "html";
            var base = this.slugbase(slug);
            var route = this.route(base);
            var skeleton;
            if(route) {
                if(route.SKELETON)
                    skeleton = route.SKELETON;
                else if(route.LIBRARY)
                    skeleton = this.options.librarySkeleton;
                else if(route.ALBUM)
                    skeleton = this.options.albumSkeleton;
            } 

            if(!skeleton)
                return this.routeContent(base, ext);

            return this.skeleton(skeleton, ext);
        },

        routeContent : function(slug, ext) {
            if(!slug)
                return;

            var version = this.options.version ? "?" + this.options.version : "";
            var ext = ext ? ext : "html";
            var route = this.route(slug);
            var content = slug;
            var path = route && route.PATH ? route.PATH : this.options.memoryPath || "";
            if(route && route.ALBUM) {
                content = this.options.albumContent;
                path = this.options.albumsPath + "/" + route.ALBUM;
            }
            var routecontent = this.options.root + path + '/' + content + "." + ext + version;
            return routecontent.replace("//", "/");
        },

        meta : function(property) {
            if(!property)
                return;

            if(property.toUpperCase() == "SLUG")
                return this.data.slug;

            var route = this.route();
            var value = route != null ? route[property] : null;
            if(value)
                return value;

            var config = this.get(Cortex.DATA.CONFIG);
            value = config != null ? config[property] : null;
            return value;
        },

        pages : function () {
            var map = this.get(Cortex.DATA.MAP);
            if(!map)
                return;

            var list = {};
            for(slug in map) {
                var page = map[slug];
                if(page && !page.ALBUM)
                    list[slug] = page;
            }
            return list;
        },

        catalog : function(filters, blacklist) {
            var map = this.get(Cortex.DATA.MAP);
            if(!map)
                return;

            var list = {};
            for(slug in map) {
                if(!map.hasOwnProperty(slug))
                    continue;

                var album = map[slug];
                var isalbum = album && album.ALBUM;
                if(!isalbum)
                    continue;

                var haspassport = !album.PRIVATE || this.routeAccess(slug);
                if(!haspassport)
                    continue;

                var inblacklist = ArrayMatchAny(blacklist, album.CATEGORY);
                if(inblacklist)
                    continue;

                var inwhitelist = ArrayMatchAny(filters, album.CATEGORY);
                if(!filters || inwhitelist)
                    list[slug] = album;
            }
            return list;
        },

        param : function (key, value) {
            //get list
            var params = this.get(Cortex.DATA.PARAMS);
            if(!key)
                return params;

            //get item
            if(value === undefined)
                return params ? params[key] : null;

            //set item
            if(!value) {
                delete params[key];
            } else {
                params[key] = value;
            }
            this.broadcast(Cortex.DATA.PARAMS);
        },

        paramMult : function (key, toggle) {
            if(!key)
                return;
            var param = this.param(key);
            var values = param ? param.split("|") : null;
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

        paramMultHas : function(key, value) {
            if(!key)
                return false;

            var values = this.paramMult(key);
            return values && values.indexOf(value) >=0 ? true : false;
        },

        getExplictParams : function () {
            var params = this.get(Cortex.DATA.PARAMS);
            if(!params)
                return "";

            var pick = ObjectPick(params, {black:["media", "noteid"]});
            var explicit = Object.keys(pick).map(function(key) {
                return "" + key + "=" + pick[key];
            });
            var params = explicit.join("&");
            return params ? "?" + params : "";
        },

        access : function(url) {
            var _this = this;
            url = url || window.location.hash;

            var map = this.get(Cortex.DATA.MAP);
            var slug = browserext.urlHash();
            var params = browserext.searchParams();
            var breadcrumb = browserext.breadcrumb(slug);
            var base = breadcrumb && breadcrumb.length > 0 ? breadcrumb[0] : null;

            if(base && map && map[base]) {
                slug = base;
                params.media = breadcrumb[1];
            }

            if(slug == this.get(Cortex.DATA.SLUG) && !this.firstaccess) {
                _this.updateData(Cortex.DATA.PARAMS, params);
                return;
            }

            return this.connect(slug).then(
                function success (response) {
                    if(!_this.catchError(response)) {
                        _this.updateData(Cortex.DATA.SLUG, slug || _this.options.defaultPage);
                        _this.updateData(Cortex.DATA.PARAMS, params);
                    }
                    _this.broadcast(Cortex.DATA.ROUTE);
                    _this.firstaccess = false;
                },
                function error (error) { _this.catchError({status:"error", error:"connection error"}) }
            );
        },



        /////////////
        // BRAIN COMMUNICATION
        ///////

        connect : function (slug) {
            this.errors = [];

            var _this = this;
            _this.inconnection = true;
            var response = _this.getStoredConnection(slug);
            if(response) return Promise.resolve().then(function () {
                    lazyAction(function() {
                        _this.updateData(Cortex.DATA.USER, response.user);
                        _this.updateData(Cortex.DATA.ROUTE, response.route);
                        _this.updateData(Cortex.DATA.LANG, response.lang);

                        if(response.route && response.route.ALBUMLINK) _this.album(response.route.ALBUMLINK);

                        _this.inconnection = false;
                    });
                    return response;
            });

            return this.synapse("connect", [slug]).then(
                function success (response) {
                    var error = _this.catchError(response);
                    if(error) return error;

                    _this.storeConnection(slug, response);

                    lazyAction(function() {
                        _this.updateData(Cortex.DATA.USER, response.user);
                        _this.updateData(Cortex.DATA.ROUTE, response.route);
                        _this.updateData(Cortex.DATA.LANG, response.lang);

                        if(response.route && response.route.ALBUMLINK) _this.album(response.route.ALBUMLINK);

                        _this.inconnection = false;
                    });
                    return response;
                },
                function error (error) { _this.inconnection = false; return _this.error(error); }
            );
        },

        storeConnection : function(slug, response) {
            if(!slug || !response)
                return;

            this.connections[slug] = response;
        },

        getStoredConnection : function(slug) {
            if(!slug || !this.connections[slug])
                return;

            return this.connections[slug];
        },

        reset : function() {
            var _this = this;
            return this.synapse("reset").then(
                function success (response) { if(_this.catchError(response)) return; window.location.reload(); },
                function error (error) { return _this.error(error); }
            );
        },

        cleanSite : function() {
            var _this = this;
            return this.synapse("cleanSite").then(
                function success (response) { if(_this.catchError(response)) return; },
                function error (error) { return _this.error(error); }
            );
        },

        activeGuardian : function (text) {
            var _this = this;
            return this.synapse("activeGuardian", [text]).then(
                function success (response) { if(_this.catchError(response)) return; },
                function error (error) { return _this.error(error); }
            );
        },

        removeGuardian : function () {
            var _this = this;
            return this.synapse("removeGuardian").then(
                function success (response) { if(_this.catchError(response)) return; },
                function error (error) { return _this.error(error); }
            );
        },

        admin : function () {
            var _this = this;
            return this.synapse("admin").then(
                function success (response) { 
                    if(_this.catchError(response))
                        return;
                    return response;
                },
                function error (error) { return _this.error(error); }
            );
        },



        /////////////
        // OPTIONS SECTION
        ///////

        lang : function(lang) {
            var _this = this;
            return this.synapse("lang", [lang]).then(
                function success (response) {
                    var error = _this.catchError(response);
                    if(error) return error;

                    lazyAction(function() {
                        _this.updateData(Cortex.DATA.LANG, response.lang);
                    });
                },
                function error (error) { return _this.error(error); }
            );
        },



        /////////////
        // USER SECTION
        ///////

        login : function (email, password) {
            var _this = this;
            return this.synapse("userLogin", [email, password]).then(
                function success (response) {
                    var error = _this.catchError(response);
                    if(error) return response;

                    lazyAction(function() {
                        _this.updateData(Cortex.DATA.USER, response.user);
                        _this.updateData(Cortex.DATA.LANG, response.user.lang);
                    });
                },
                function error (error) { return _this.error(error); }
            );
        },

        logout : function () {
            var _this = this;
            return this.synapse("userLogout").then(
                function success (response) {
                    var error = _this.catchError(response);
                    if(error) return error;

                    lazyAction(function() {
                        _this.updateData(Cortex.DATA.USER, response.user);
                    });
                },
                function error (error) { return _this.error(error); }
            );
        },

        register : function (email, password, news, lang) {
            var _this = this;
            return this.synapse("userCreate", [email, password, news, lang]).then(
                function success (response) {
                    setTimeout(function() {
                        if(_this.catchError(response)) return;
                        _this.updateData(Cortex.DATA.USER, response.user);
                    }, 0);
                },
                function error (error) { return _this.error(error); }
            );
        },

        confirm : function (email, token) {
            var _this = this;
            return this.synapse("userConfirm", [email, token]).then(
                function success (response) {
                    if(_this.catchError(response)) return;
                    _this.updateData(Cortex.DATA.USER, response.user);
                },
                function error (error) { return _this.error(error); }
            );
        },

        retrievePassword : function (email) {
            var _this = this;
            return this.synapse("userRetrievePassword", [email]).then(
                function success (response) {
                    if(_this.catchError(response)) return;
                    _this.updateData(Cortex.DATA.USER, response.user);
                },
                function error (error) { return _this.error(error); }
            );
        },

        user : function () {
            var _this = this;
            return this.synapse("userCurrent").then(
                function success (response) {
                    if(_this.catchError(response)) return;
                    _this.updateData(Cortex.DATA.USER, response.user);
                },
                function error (error) { return _this.error(error); }
            );
        },

        userAddFavorite : function(slug) {
            var _this = this;
            return this.synapse("userAddFavorite", [slug]).then(
                function success (response) { if(_this.catchError(response)) return; },
                function error (error) { return _this.error(error); }
            );
        },

        userRemoveFavorite : function(slug) {
            var _this = this;
            return this.synapse("userRemoveFavorite", [slug]).then(
                function success (response) { if(_this.catchError(response)) return; },
                function error (error) { return _this.error(error); }
            );
        },

        addPassport : function(email, slug) {
            var _this = this;
            return this.synapse("userAddPassport", [email, slug]).then(
                function success (response) { if(_this.catchError(response)) return; },
                function error (error) { return _this.error(error); }
            );
        },

        userRemovePassport : function(email, slug) {
            var _this = this;
            return this.synapse("userRemovePassport", [email, slug]).then(
                function success (response) { if(_this.catchError(response)) return; },
                function error (error) { return _this.error(error); }
            );
        },

        userHasPassport : function (user, slug) {
            user = user || this.user();
            if(!user || !user.passport)
                return false;

            return user.passport[slug];
        }



    });
    ClientData.prototype.constructor = ClientData;



    /////////////
    // private
    ///////
    function isData (key) {
        for(k in Cortex.DATA) {
            if(Cortex.DATA[k] == key)
              return true;
        }
        return false;
    }

    function setRoot (instance, root) {
        //hold the neurone root to broadcast
        instance.root = root;
    }

    function startModule (instance) {
        if(!instance) return;

        instance.module = angular.module(instance.options.module, instance.options.dependencies)
        .run(function($rootScope, $location) {
            setRoot(instance, $rootScope);
            $rootScope.$on("$locationChangeStart", function(event, next, current) {
                lazyAction(function(){
                    instance.access(next);
                });
            });
        });

        instance.loadResource(Cortex.DATA.CONFIG, instance.options.config)
        .then(function success () {
            instance.loadResource(Cortex.DATA.COMMON, instance.options.common)
            .then(function success () {
                instance.loadResource(Cortex.DATA.MAP, instance.options.sitemap)
                .then(function success (response) {
                    lazyAction(function(){
                        instance.access();
                    });
                });
            });
        });
    }


    // global functions
    window.translate = Cortex.translate;

    return Cortex;
})(jQuery, tracer, ClientData, Synapse, browserext);