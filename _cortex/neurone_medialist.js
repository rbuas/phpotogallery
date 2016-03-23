(function ($, tracer, cortex) {
    cortex.directive('medialist', function () {
        return {
            restrict:'AE',
            templateUrl: cortex.skeleton('medialist'),
            scope: { 
                list : '=',
                listid : '=',
                listlimit : '=',
                playtimer : '=',
                loop : '='
            },
            controller: function($scope, $location, $timeout, $window) {
                var instance = $scope;
                instance.autoplay = null;
                instance.restart = false;
                instance.medialist = [];
                instance.popinactive = false;
                instance.startlimit = 0;

                instance.translate = function(token, forcelang) {
                    return cortex.translate(token, forcelang);
                }

                instance.goToIndex = function (index, event) {
                    if(event) {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    instance.popinactive = true;

                    if(!instance.swiper || !instance.swiper.slideTo)
                        return;

                    $timeout(function(){
                        postRedraw(instance, index);
                        //instance.swiper.slideTo(index);
                        $("body").animate({scrollTop: $("#swiper-" + instance.medialistid).offset().top}, 800);
                    });
                };

                instance.moreImages = function () {
                    instance.startlimit = 2*instance.startlimit;
                    if(instance.startlimit > instance.medialist.length)
                        instance.startlimit = instance.medialist.length;
                };

                instance.$watch('playtimer', function (playtimer) {
                    if(typeof playtimer !== 'undefined') instance.autoplay = playtimer;
                }.bind(instance));

                instance.$watch('loop', function (loop) {
                    instance.restart = loop;
                }.bind(instance));

                instance.$watch('listlimit', function (listlimit) {
                    instance.startlimit = listlimit || 1000;
                }.bind(instance));

                instance.$watch('listid', function (listid) {
                    instance.medialistid = listid;
                }.bind(instance));

                instance.$watch('list', function (list) {
                    instance.medialist = list;
                    $timeout(function(){
                        postRedraw(instance);
                    });
                }.bind(instance));
            }
        };
    });

    function postRedraw (instance, index) {
        if(!instance)
            return;

        if(instance.swiper) instance.swiper.destroy(true, true);

        instance.swiper = new Swiper("#swiper-" + instance.medialistid, {
            initialSlide : index,
            autoplay: instance.autoplay,
            loop: instance.restart,

            // Optional parameters
            spaceBetween: 30,
            //freeMode: true,
            freeModeMomentum : true,
            grabCursor: true,
            keyboardControl: true,
            //mousewheelControl: true,

            parallax: true,

            preloadImages: false,
            lazyLoading: true,

            //paginationClickable: true,
            //pagination: '.swiper-pagination',

            autoplayDisableOnInteraction: false,

            //scrollbar: '.swiper-scrollbar',
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev'
        });
    }

})(jQuery, tracer, cortex);