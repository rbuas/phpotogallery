var CortexTest = {

    getConnection : TEST.CreateCase("getConnection", function(slug, status) {
        var success = false;
        var cortex = new Cortex({asyncMode:false});

        cortex.connect(slug).then(function(data) {
            if(status == "error" && !data) {
                success = true;
                return true;
            }

            if(!ASSERT_DIFF(data, null, "Invalid data.")) {
                success = false;
                return false;
            }

            if(!ASSERT_DIFF(data.access, null, "Invalid access.")) {
                success = false;
                return false;
            }

            if(!ASSERT_DIFF(data.route, null, "Invalid route.")) {
                success = false;
                return false;
            }

            if(!ASSERT_EQ(data.status, status, "Invalid status.")) {
                success = false;
                return false;
            }

            success = true;
            return true;
        });

        return success;
    }),

    registerUser : TEST.CreateCase("registerUser", function(email, password, news, lang) {
        var success = false;
        var cortex = new Cortex({asyncMode:false});
        cortex.register(email, password, news, lang);
        cortex.user();
        cortex.login(email, password);
        cortex.confirm(email, "asdasdasdasda")
    });

};

$( document ).ready(function() {

    TEST.SetOutputContainer("#test_panel");

    TEST.StartSession("Connection");
    CortexTest.getConnection(null, "success");
    CortexTest.getConnection("", "success");
    CortexTest.getConnection("portfolio", "success");
    CortexTest.getConnection("nonexistentpage", "error");
});