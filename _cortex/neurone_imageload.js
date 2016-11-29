(function ($, tracer, cortex) {
    cortex.directive('imageonload', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.addClass("imageonload-waiting");

                element.bind('load', function() {
                    element.removeClass("imageonload-waiting");
                    element.addClass("imageonload-loaded");
                });

                element.bind('error', function(){
                    element.removeClass("imageonload-waiting");
                    element.addClass("imageonload-error");
                });
            }
        };
    });
})(jQuery, tracer, cortex);