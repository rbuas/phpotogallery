(function ($, tracer, cortex, browserext) {
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

                    if(!browserext.elemIsInView($element))
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
            }
        };
    });
})(jQuery, tracer, cortex, browserext);