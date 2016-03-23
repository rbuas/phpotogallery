(function ($, tracer, cortex) {
    cortex.controller('NeuroneRoute', ['$scope', '$rootScope', '$timeout', function NeuroneMaster ($scope, $rootScope, $timeout) {
        var route = this;

        this.getRouteData = function(data) {
            var route = cortex.route();
            if(!route)
                return;

            return route[data];
        };
    }]);
})(jQuery, tracer, cortex);