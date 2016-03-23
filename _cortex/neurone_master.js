(function ($, tracer, cortex) {
    cortex.controller('NeuroneMaster', ['$scope', '$rootScope', '$timeout', function NeuroneMaster ($scope, $rootScope, $timeout) {
        var master = this;
        master.errors = null;

        master.skeleton = function(skeleton) {
            return cortex.skeleton(skeleton);
        };

        master.skin = function(file) {
            return cortex.skin(file);
        };

        master.config = function(info) {
            return cortex.config(info);
        };

        master.translate = function(token) {
            return cortex.translate(token);
        };

        master.waiting = function() {
            return !cortex.ready || cortex.waiting() > 0;
        };

        master.inconnection = function() {
            return !cortex.ready || cortex.inconnection;
        };

        master.setLang = function(lang) {
            cortex.lang(lang);
        };

        master.getRouteData = function(data) {
            var route = cortex.route();
            if(!route)
                return;

            return route[data];
        };

        master.getRouteDataItemRandom = function(data) {
            var routedata = master.getRouteData(data);
            if(!routedata)
                return;

            var index = Math.floor(Math.random()*routedata.length);
            return routedata[index];
        };

        master.goToCard = function (direction) {
            goToCard(direction);
        };


        /////////////
        // PRIVATE
        ///////

        function updateBasic () {

            master.today = new Date();
        }

        function updateConfig () {
            master.menu = [];
            var menu = cortex.config("MENU");
            if(menu) {
                menu.forEach(function(slug) {
                    var route = cortex.route(slug);

                    if(route && cortex.routeAccess(slug))
                        master.menu.push({
                            slug : slug,
                            label : cortex.translate(route.TITLE),
                            tip : cortex.translate(route.RESUME),
                            icon : 'menu-' + slug + '.png'
                        });
                });
            }

            var followus = cortex.config("FOLLOWUS");
            master.followus = !followus ? null : Object.keys(followus).map(function(key) {
                var link = followus[key];
                if(!link)
                    return;

                return {
                    key : key,
                    link : link,
                    title : cortex.translate(key),
                    icon : cortex.skin("social-" + key.toLowerCase() + ".png")
                };
            });

            var feed = cortex.config("FEED");
            master.feed = !feed ? null : Object.keys(feed).map(function(key) {
                return {
                    key : key,
                    link : "/" + key + ".rss",
                    title : cortex.translate(key),
                    icon : cortex.skin("feed-feed.png")
                };
            });
        }

        function updateLanguages () {
            var languages = cortex.config("LANGUAGES");
            var current = cortex.get(Cortex.DATA.LANG);

            master.language = null;
            master.languages = !languages ? null : languages.map(function(lang, index) {
                var langitem = {
                    lang:lang,
                    tip:cortex.translate(lang),
                    icon:"lang-" + lang.toLowerCase() + ".png"
                };

                if(lang == current) master.language = langitem;
                return langitem;
            });
        }

        function updateMaps () {
            master.pages = [];
            var pages = cortex.pages();
            if(pages) {
                Object.keys(pages).sort().forEach(function(slug) {
                    var page = pages[slug];
                    var access = cortex.routeAccess(slug);
                    if(!page || !access)
                        return null;

                    master.pages.push({
                        slug : slug,
                        label : cortex.translate(page.TITLE),
                        tip : cortex.translate(page.RESUME)
                    });
                });
            }

            master.catalog = [];
            var catalog = cortex.catalog();
            if(catalog) {
                Object.keys(catalog).sort().reverse().forEach(function(slug) {
                    var album = catalog[slug];
                    var access = cortex.routeAccess(slug);
                    if(!album || !access)
                        return;

                    master.catalog.push({
                        slug : slug,
                        label : cortex.translate(album.TITLE),
                        tip : cortex.translate(album.RESUME),
                        image : album.COVER,
                        tags : album.CATEGORY
                    });
                });
            }
        }

        function updateRoute () {
            var route = cortex.route();
            if(!route)
                return;

            master.slug = cortex.get(Cortex.DATA.SLUG);
            master.params = cortex.get(Cortex.DATA.PARAMS);

            master.route = !route ? null : {
                skeleton : cortex.routeSkeleton(master.slug),
                content : cortex.routeContent(master.slug),
                resume : cortex.translate(route.RESUME),
                title : cortex.translate(route.TITLE),
                album : route.ALBUM ? master.slug : route.ALBUMLINK,
                collection : route.COLLECTION,
                library : route.LIBRARY ? route.LIBRARY.join("|") : null
            };

            var title = [];
            var config = cortex.get(Cortex.DATA.CONFIG);
            if(config && config.SITENAME) title.push(config.SITENAME);
            if(route && route.TITLE) title.push(cortex.translate(route.TITLE));
            title = title.join(" | ").toLowerCase();
            document.title = title;

            $('meta[name="canonical"]').attr('content', "#/" + cortex.meta("SLUG"));
            $('meta[name="description"]').attr('content', cortex.meta("RESUME"));
            $('meta[name="author"]').attr('content', cortex.meta("AUTHOR"));

            $('meta[property="og:title"]').attr('content', title);
            $('meta[property="og:url"]').attr('content', "#/" + cortex.meta("SLUG"));
            $('meta[property="og:description"]').attr('content', cortex.meta("RESUME"));
            $('meta[property="og:site_name"]').attr('content', cortex.meta("SITENAME"));
            $('meta[property="og:type"]').attr('content', cortex.meta("SITETYPE"));
        }

        function updateMessages () {
            master.errors = cortex.error();
        }

        function updateView () {
            $timeout(function() {
                viewRefresh();
            });
        }

        function update () {
            updateBasic();
            updateMaps();
            updateConfig();
            updateLanguages();
            updateRoute();
            updateMessages();
            updateView();
        }

        /////////////
        // LISTENERS
        ///////

        $scope.$on(Cortex.DATA.MAP, function() { update(); $scope.$apply(); });
        $scope.$on(Cortex.DATA.USER, function() { update(); $scope.$apply(); });
        $scope.$on(Cortex.DATA.ROUTE, function() {
            master.mainmenuopened = false;
            update(); 
            $timeout(function(){ 
                $scope.$apply(); 
                $("body").stop().animate({scrollTop: 0}, 800); 
            }, 250);
        });
        $scope.$on(Cortex.DATA.ALBUM, function() { update(); });
        $scope.$on(Cortex.DATA.LANG, function() { updateLanguages(); $scope.$apply(); });
        $scope.$on(Cortex.DATA.ERROR, function() { updateMessages(); $scope.$apply(); });

    }]);
})(jQuery, tracer, cortex);