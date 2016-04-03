(function ($, tracer, cortex, browserext) {
    cortex.directive('mediaalbum', function () {
        return {
            restrict:'AE',
            templateUrl: cortex.skeleton('mediaalbum'),
            scope: { 
                slug : '=',
                limit : '=',
                urlless : '=',
                playtimer : '=',
                filter : "=",
                loop : '=',
                showcontrol : '=',
                showinfo : '=',
                mode : '=' //SLIDE || HISTORYLINE
            },
            //controllerAs : 'album',
            controller: function($scope, $location, $timeout, $window) {
                var instance = $scope;
                instance.writeurl = true;
                instance.autoplay = null;
                instance.restart = false;
                instance.persistentfilter = null;
                instance.mediainfo = [];
                instance.showcontrolpanel = true;
                instance.showinfopanel = true;
                instance.viewmode = browserext.ios() ? "HISTORYLINE" : "SLIDE"; 

                instance.translate = function(token, forcelang) {
                    return cortex.translate(token, forcelang);
                };

                instance.toggleFilter = function (filter) {
                    cortex.paramMult("f", filter);
                    if(!instance.writeurl)
                        return;

                    var hash = "#/" + cortex.get(Cortex.DATA.SLUG) + cortex.getExplictParams();

                    window.location.hash = hash;
                    //window.location.replace(hash);
                    //window.location.reload();
                };

                instance.setTeaserMode = function(teaser) {
                    if(!instance.album)
                        return;

                    teaser = teaser != null ? teaser : false;
                    instance.album.teaser = teaser;

                    $timeout(function(){
                        updateParams(instance);
                    });
                };

                instance.isFilterActive = function (filter) {
                    return cortex.paramMultHas("f", filter);
                };

                instance.goToIndex = function (index, mediaid, event) {
                    if(event) {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    if(instance.swiper && instance.swiper.slideTo)
                        instance.swiper.slideTo(index);

                    $("body").animate({scrollTop: $("#mediaitem-" + mediaid).offset().top}, 800, "easeInOutBack");
                    //$window.scrollTo(0,0);
                };

                instance.skeleton = function (skeleton) {
                    return cortex.skeleton(skeleton);
                };

                instance.isVisibleInfo = function (media) {
                    if(!media)
                        return false;
                    return instance.mediainfo[media];
                };

                instance.showMediaInfo = function (media, show) {
                    if(!media)
                        return;

                    show = show != null ? show : !instance.mediainfo[media];
                    instance.mediainfo[media] = show;
                    if(show) instance.reshapeMediaInfo(media);
                };

                instance.reshapeMediaInfo = function (media) {
                    if(!media || !instance.mediainfo[media])
                        return;

                    var mediaObj = $("#mediaitem-" + media + " .inbox");
                    var mediaInfo = $("#mediaitem-" + media + " .mediainfos");
                    if(!mediaObj || mediaObj.length < 1 || !mediaInfo || mediaInfo.length < 1)
                        return;

                    mediaObj = mediaObj[0];
                    mediaInfo.css({
                        height : mediaObj.height + 1 + "px",
                        width : mediaObj.width + "px",
                        top : mediaObj.offsetTop + "px",
                        left : mediaObj.offsetLeft + "px"
                    });
                };

                $scope.$on(Cortex.DATA.PARAMS, function() {
                    $timeout(function(){
                        updateParams(instance);
                    });
                });

                instance.$watch('mode', function (mode) {
                    if(typeof mode !== 'undefined') instance.viewmode = mode;
                }.bind(instance));

                instance.$watch('showcontrol', function (showcontrol) {
                    if(typeof showcontrol !== 'undefined') instance.showcontrolpanel = showcontrol;
                }.bind(instance));

                instance.$watch('showinfo', function (showinfo) {
                    if(typeof showinfo !== 'undefined') instance.showinfopanel = showinfo;
                }.bind(instance));

                instance.$watch('filter', function (filter) {
                    if(typeof filter !== 'undefined')
                        instance.persistentfilter = filter ? filter.split("|") : null;
                }.bind(instance));

                instance.$watch('playtimer', function (playtimer) {
                    if(typeof playtimer !== 'undefined') instance.autoplay = playtimer;
                }.bind(instance));

                instance.$watch('urlless', function (urlless) {
                    instance.writeurl = typeof urlless === 'undefined' || urlless == false;
                }.bind(instance));

                instance.$watch('loop', function (loop) {
                    instance.restart = loop;
                }.bind(instance));

                instance.$watch('slug', function (slug) {
                    instance.album = null;
                    instance.slug = slug;

                    if(instance.slug) {
                        instance.firsttime = true;
                        cortex.album(instance.slug).then(
                            function (album) { 
                                updateInfo(instance);
                                $timeout(function(){
                                    updateAlbum(instance, album);
                                });
                            }
                        );
                    }
                }.bind(instance));
            }
        };
    });

    function updateInfo (instance) {
        if(!instance)
            return;

        var siteurl = cortex.config("SITEURL") || "";
        var sitename = cortex.config("SITENAME") || "";
        var mailBase = "mailto:?subject=[" + sitename.toUpperCase() + "]&amp;body=";

        instance.info = {
            permalinkIcon : cortex.skin("permalink.png"),
            permalinkTip : cortex.translate('PERMALINK_BUTTON_TIP'),
            mediawebIcon : cortex.skin("download-web.png"),
            mediawebTip : cortex.translate('DOWNLOADWEB_BUTTON_TIP'),
            mailIcon : cortex.skin("menu-contact.png"),
            mailTip : cortex.translate('MAIL_BUTTON_TIP'),
            mailBase : mailBase + siteurl,
            facebookTip : cortex.translate('FACEBOOK_BUTTON_TIP'),
            facebookBase : "https://facebook.com/sharer.php?u=" + siteurl,
            facebookIcon : cortex.skin("social-facebook.png"),
            pinterestBase : "http://pinterest.com/pin/create/button/?url=" + siteurl,
            pinterestIcon : cortex.skin("social-pinterest.png"),
            pinterestTip : cortex.translate('PINTEREST_BUTTON_TIP'),
            gplusBase : "https://plus.google.com/share?url=" + siteurl,
            gplusTip : cortex.translate('GPLUS_BUTTON_TIP'),
            gplusIcon : cortex.skin("social-googleplus.png"),
            twitterBase : "https://twitter.com/home?status=",
            twitterIcon : cortex.skin("social-twitter.png"),
            twitterTip : cortex.translate('TWITTER_BUTTON_TIP'),
            siteurl : siteurl
        };
    }

    function updateParams (instance) {
        if(!instance)
            return;

        updateExplicitParams(instance);
        var album = instance.album ? instance.album : null;
        if(!album)
            return;

        updateMedia(instance);

        var filternew = cortex.param("f");
        if(filternew == album.filterlast && album.teaserlast == album.teaser && !instance.firsttime)
            return;

        instance.firsttime = false;
        album.filterlast = filternew;
        album.teaserlast = album.teaser;
        album.filter = cortex.paramMult("f");

        if(!album.list)
            return;

        instance.currentMediaIndex = 0;
        var viewcount = 0;
        album.viewlist = [];
        for(var i = 0; i < album.list.length ; i++) {
            var item = album.list[i];
            if(!item)
                continue;

            if(instance.persistentfilter && !ArrayMatchAny(item.Tags, instance.persistentfilter))
                continue;

            if(album.filter && !ArrayMatchAny(item.Tags, album.filter))
                continue;

            if(album.teaser && item.Rating < 4)//TODO : select 5 in albums and change it to test 5
                continue;

            if(album.media && item.id == album.media) {
                instance.currentMediaIndex = viewcount;
            }
            viewcount++;

            album.viewlist.push(item);
        }
        postRedraw(instance);
    }

    function postRedraw (instance) {
        if(!instance)
            return;

        if(instance.viewmode != "SLIDE")
            return;

        instance.$digest();

        if(instance.swiper && instance.swiper.destroy) instance.swiper.destroy(true, true);

        instance.swiper = new Swiper('.swiper-container', {
            initialSlide : instance.currentMediaIndex,
            hashnav: instance.writeurl,
            autoplay: instance.autoplay,
            loop: instance.restart,
            effect : "slide",// "slide"|"fade"|"cube"|"coverflow"

            // Optional parameters
            spaceBetween: 30,
            //freeMode: true,
            freeModeMomentum : true,
            grabCursor: true,
            keyboardControl: true,
            //mousewheelControl: true,

            parallax: false,

            preloadImages: false,
            watchSlidesProgress: true,
            lazyLoadingInPrevNext: false,
            lazyLoading: true,

            //paginationClickable: true,
            //pagination: '.swiper-pagination',

            autoplayDisableOnInteraction: false,

            //scrollbar: '.swiper-scrollbar',
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev'
        }); 
    }

    function updateExplicitParams (instance) {
        //uptade explict params to use it in all album urls
        instance.explicitParams = cortex.getExplictParams();
    }

    function updateMedia (instance) {
        if(!instance || !instance.album)
            return;

        instance.album.media = cortex.param("media");
    }

    function updateAlbum (instance, album) {
        if(!instance || !album || !album.INDEX)
            return;

        var path = album.PATH || "";

        album.title = cortex.translate(album.TITLE);
        album.resume = cortex.translate(album.RESUME);
        album.image = "/media" + path + "web/" + album.COVER;
        album.content = cortex.routeContent(album.ALBUM);
        album.teaser = true;
        album.tags = album.PASSPORT ? album.PRIVATETAGS : album.PUBLICTAGS;

        var tags = [];
        album.list = [];
        var count = 0;
        for(var id in album.INDEX) {
            var media = bindMedia(album, id);
            if(!media)
                continue;

            album.list.push(media);
            count++;
        }

        instance.album = album;

        updateParams(instance);
    }

    function mediaStyle (media) {
        if(!media || !media.H || !media.W)
            return;

        if(media.H == media.W)
            return "format_sq";

        return (media.H > media.W) ? "format_it" : "format_fr";
    }

    function bindMedia (album, id) {
        if(!album || !album.INDEX)
            return;

        var media = album.INDEX[id];
        if(!media)
            return;

        var path = media.Path || album.PATH;

        if(media.Tags) media.Tags = Array.isArray(media.Tags) ? media.Tags : [media.Tags];

        media.id = id;
        media.filethumb = "/media" + path + "thumb/" + id;
        media.fileweb = browserext.mobile() ? "/media" + path + "mob/" + id : "/media" + path + "web/" + id;
        media.filelow = "/media" + path + "low/" + id;
        media.downloadweb = "/mediaget" + path + "web/" + id;
        media.style = mediaStyle(media);
        media.title = id;
        return media;
    }

})(jQuery, tracer, cortex, browserext);