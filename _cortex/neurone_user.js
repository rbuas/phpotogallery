(function ($, tracer, cortex) {
    cortex.controller('NeuroneUser', ['$scope', '$rootScope', function NeuroneUser ($scope, $rootScope) {
        var user = this;
        user.postback = false;
        user.message = null;
        user.messageType = null;


        user.register = function(event) {
            if(event) {
                var keyCode = event.which || event.keyCode;
                if(keyCode != 13)
                    return;
            }

            user.postback = true;
            if(!user.login_mail || !user.login_pass)
                return;

            cortex.register(user.login_mail, user.login_pass).then(
                function success (response) { updateError(false); },
                function error (error) { updateError(true, error); }
            );
        };

        user.login = function(event) {
            if(event) {
                var keyCode = event.which || event.keyCode;
                if(keyCode != 13)
                    return;
            }

            user.postback = true;
            if(!user.login_mail || !user.login_pass)
                return;

            user.login_mail_error = user.login_mail.indexOf("@") < 0 || user.login_mail.indexOf(".") < 0;
            if(user.login_mail_error)
                return;

            cortex.login(user.login_mail, user.login_pass).then(
                function success (response) {
                    var error = !response || response.status != "success";
                    updateError(error, response && response.status_message);
                },
                function error (error) { updateError(true, error); }
            );
        };

        user.logout = function() {
            user.postback = true;

            cortex.logout().then(
                function success (response) { updateError(false); },
                function error (error) { updateError(true, error); }
            );
        };

        user.retrievePassword = function() {
            user.postback = true;
            if(!user.login_mail)
                return;

            cortex.retrievePassword(user.login_mail).then(
                function success (response) { updateError(false); },
                function error (error) { updateError(true, error); }
            );
        };

        user.isLogged = function() {
            return user.current && user.current.email;
        }


        /////////////
        // PRIVATE
        ///////

        function updateError (error, message) {
            user.postback = error;
            user.message = message;
            user.messageType = error ? "error" : "success";
            lazyAction(function(){
                $scope.$apply();
            })
        }

        function updateUser () {
            user.current = cortex.get(Cortex.DATA.USER);

            var button = user.current ? "button-online.png" : "button-offline.png";
            user.mainbutton = cortex.skin(button);

            user.salutation = new Date().getHours() < 18  ? 
                                cortex.translate("GOODMORNING") :
                                cortex.translate("GOODNIGHT");
        }

        $scope.$on(Cortex.DATA.USER, function() {
            updateUser();

            $scope.$apply();
        });

        $scope.$on(Cortex.DATA.LANG, function() {
            updateUser();

            $scope.$apply();
        });

        updateUser();
    }]);
})(jQuery, tracer, cortex);