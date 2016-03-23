var UNIT_TEST = true;
if (UNIT_TEST) {
        
    var TestClientStorage = {

        Set : function(key, value) {
            ClientStorage.Set(key, value);
            ASSERT_EQ(ClientStorage.Get(key), value);
        }

    };

    TestClientStorage.Set("varA", "valueA");

}/*** /UNIT_TEST ***/