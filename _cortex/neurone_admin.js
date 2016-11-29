(function ($, tracer, cortex) {
    cortex.controller('NeuroneAdmin', ['$scope', '$rootScope', function NeuroneAdmin ($scope, $rootScope) {
        var admin = this;

        admin.guardianactive = null;
        admin.guardian = "";
        admin.userlist = null;
        admin.pages = cortex.pages();
        //admin.accesslist = cortex.get(Cortex.DATA.MAP);

        admin.removeGuardian = function () {
            cortex.removeGuardian();
        };

        admin.activeGuardian = function (text) {
            cortex.activeGuardian(text);
        };

        admin.buildSite = function () {
            cortex.buildSite();
        };

        admin.cleanSite = function () {
            cortex.cleanSite();
        };

        admin.buildAlbum = function (slug) {
            cortex.buildAlbum(slug).then(function(){
               $scope.$apply();
            });
        };

        cortex.admin().then(
            function success (response) {
               if(response && response.userlist) admin.userlist = response.userlist;
               if(response && response.catalog) admin.catalog = response.catalog;
               lazyAction(function() {
                   $scope.$apply();
               });
            }
        );

    }]);
})(jQuery, tracer, cortex);