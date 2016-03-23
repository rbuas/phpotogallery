(function ($, tracer, cortex) {
    cortex.directive('imageinview', function() {
        return {
            restrict: 'A',
            link: function($scope, $element, $attrs) {
                $element.addClass("imageinview-waiting");

                $element.bind('load', function() {
                    $element.removeClass("imageinview-waiting");
                    $element.addClass("imageinview-loaded");
                });

                $element.bind('error', function(){
                    $element.removeClass("imageinview-waiting");
                    $element.addClass("imageinview-error");
                });

                $(window).bind('scroll', function(){
                    loadImageWaiting();
                });
                $scope.$watch(function(){
                    loadImageWaiting();
                });

                function loadImageWaiting() {
                    if(!$element.hasClass("imageinview-waiting"))
                        return;

                    if(!checkIfInView($element))
                        return;

                    changeSource($element);
                }

                function changeSource (element) {
                    if(!element)
                        return;

                    var datasrc = element.attr('data-src');
                    if(!datasrc) {
                        element.addClass("imageinview-error");
                        return;
                    }

                    element.attr('src', datasrc);
                }

                function checkIfInView (element) {
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
            }
        };
    });
})(jQuery, tracer, cortex);