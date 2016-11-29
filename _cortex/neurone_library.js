(function ($, tracer, cortex) {

    cortex.directive('medialibrary', function () {
        return {
            restrict:'AE',
            templateUrl: cortex.skeleton('medialibrary'),
            scope: { filter : '=', exfilter: '=', limit : '=' },
            //controllerAs : 'library',
            controller: function($scope, $location, $timeout, $window) {
                var instance = $scope;
                instance.blacklist = "personal";

                instance.toggleFilter = function (filter) {
                    cortex.paramMult("f", filter);

                    var hash = "#/" + cortex.get(Cortex.DATA.SLUG) + cortex.getExplictParams();

                    window.location.hash = hash;
                    //window.location.reload();
                };

                instance.isFilterActive = function (filter) {
                    return cortex.paramMultHas("f", filter);
                };

                instance.inUserFilter = function (album) {
                    if(!album)
                        return false;

                    var userfilter = cortex.paramMult("f");
                    if(!userfilter || userfilter.length == 0)
                        return true;

                    var infilter = ArrayMatchAny(userfilter, album.tags);
                    return infilter;
                };

                instance.$watch('exfilter', function (newValue) {
                    instance.blacklist = newValue != null ? newValue : instance.blacklist;
                    updateFilters(instance, true);
                }.bind(instance));

                instance.$watch('filter', function (newValue) {
                    instance.filter = newValue;
                    updateFilters(instance, true);
                }.bind(instance));

                $scope.$on(Cortex.DATA.PARAMS, function() {
                    lazyAction(function(){
                        updateFilters(instance, false);
                        $scope.$apply();
                    });
                });

                updateFilters(instance, true);
            }
        };

        function updateFilters (instance, updatelist) {
            if(!instance)
                return;

            instance.filters = readFilters(instance.filter);
            instance.filters = instance.filters.unique();
            if(instance.filters.length == 0) instance.filters = null;

            instance.blacklist = readFilters(instance.blacklist);
            instance.blacklist = instance.blacklist.unique();

            if(!updatelist)
                return;

            updateList(instance, updatelist);
        }

        function readFilters (filter) {
            if(!filter)
                return [];

            if(typeof(filter) == "object")
                return filter;

            return filter.split("|");
        }

        function bindAlbum (slug, album) {
            var path = album.PATH || "";
            var coverpath = album.COVERPATH ? path + album.COVERPATH : path;
            coverpath = "/media/" + coverpath;
            coverpath = coverpath.replace("//", "/");
            return {
                slug : slug,
                label : cortex.translate(album.TITLE),
                resume : cortex.translate(album.RESUME),
                image : coverpath + "mob/" + album.COVER,
                thumb : coverpath + "thumb/" + album.COVER,
                tags : album.CATEGORY
            };
        }

        function updateList (instance, updatetags) {
            if(!instance)
                return;

            var tags = [];

            var list = cortex.catalog(instance.filters, instance.blacklist);
            var sortedlist = Object.keys(list).sort().reverse();
            instance.library = [];
            for(var a in sortedlist) {
                if(!sortedlist.hasOwnProperty(a))
                    continue;

                var slug = sortedlist[a];
                if(!slug)
                    continue;

                var album = list[slug];
                if(!album)
                    continue;

                if(album.CATEGORY) tags = tags.concat(album.CATEGORY);

                instance.library.push(bindAlbum(slug, album));
            }

            if(updatetags) {
                instance.tags = tags.unique();
            }
        }
    });
})(jQuery, tracer, cortex);