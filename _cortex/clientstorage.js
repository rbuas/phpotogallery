/////////////////////////////////////////////////////////////////
// ClientStorage
/////////////////////////////////////////////////////////////////

ClientStorage = (function ($) {

    /**************
    * @class ClientStorage
    *******/
    function ClientStorage (options) {
        var defaults = {
            storagetype : ClientStorage.STORAGE_BROWSER,
            persistentData : [],
            nonPersistentData : [],
            initialData : {}
        };

        this.options = $.extend({}, defaults, options);

        // properties
        this._storage = null;
        this.data = this.options.initialData ?  $.extend({}, this.options.initialData) : {};

        //initialise storage
        var canUseBrowserStorage = testLocalStoragePermissions();
        if (!canUseBrowserStorage || this.options.storagetype == ClientStorage.STORAGE_COOKIE) {
            this._storage = CookieStorage;
        } else {
            this._storage = BrowserStorage;
        }

        this.init(this.options.persistentData);
    };

    ClientStorage.STORAGE_BROWSER = 'STORAGE_BROWSER';
    ClientStorage.STORAGE_COOKIE = 'STORAGE_COOKIE';

    ClientStorage.prototype = {

        init : function (keys) {
            if(!keys)
                return;

            for(var k in keys) {
                var key = keys[k];
                var loadedValue = this._storage.get(key);
                this.set(key, loadedValue);
            }
        },

        save : function () {
            if(!this.data)
                return;

            for(var key in this.data) {
                if(!this.isPersistent(key))
                    continue;

                var value = this.get(key);

                if(value === null)
                    this._storage.reset(key);
                else 
                    this._storage.set(key, value);
            }
        },

        load : function () {
            if(!this.data)
                return;

            var loaded = {};

            for(var key in this.data) {
                var loadedValue = this._storage.get(key);
                loaded[key] = loadedValue;
            }

            this.data = loaded;
        },

        set: function (key, value) {
            if(!key)
                return;

            this.data[key] = value;
        },

        get : function (key) {
            if(key in this.data)
                return this.data[key];
        },

        collection: function () {
            return this.data;
        },

        reset : function (key) {
            if(!key)
                return false;

            this.data[key] = null;
            delete this.data[key];
        },

        isPersistent : function (key) {
            return this.options.persistentData.indexOf(key) >= 0 
                    && this.options.nonPersistentData.indexOf(key) < 0;

        }
    };

    /////////////
    // PUBLIC
    ///////

    /**************
    * @class BrowserStorage
    *******/
    BrowserStorage = {
        storagetype: ClientStorage.STORAGE_BROWSER,
        set : function (key, value) {
            if (typeof value == 'undefined')
                return;

            if (typeof value == 'function')
                return;

            var serValue = JSON.stringify(value);
            //DEBUG console.log("set key : " + key, serValue);

            window.localStorage.setItem(key, serValue);
        },

        get : function (key) {
            var value = window.localStorage.getItem(key);
            //DEBUG console.log("get key : " + key, value);

            if(!value)
                return value;

            return JSON.parse(value);
        },

        reset : function (key) {
            window.localStorage.removeItem(key);
        }

    };

    /**************
    * @class CookieStorage
    *******/
    CookieStorage = {
        storagetype: ClientStorage.STORAGE_COOKIE,
        set : function (key, value) {
            var strValue = JSON.stringify(value);
            var expires = new Date(new Date().setYear(new Date().getFullYear() + 1));
            document.cookie = key + "=" + strValue + ";path=/; expires=" + expires.toString() + ";";
        },

        get : function (key) {
            var keyEQ = key + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);

                if (c.indexOf(keyEQ) == 0) {
                    var value = c.substring(keyEQ.length, c.length);
                    var parsedValue;
                    try {
                        parsedValue = JSON.parse(value);
                    } catch (e) {
                        parsedValue = value;
                    }
                    return parsedValue;
                }
            }
            return null;
        },

        reset : function (key) {
            document.cookie = key + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
        }
    }



    /////////////
    // PRIVATE
    ///////

    function testLocalStoragePermissions () {
        if ('localStorage' in window) {
            try {
                window.localStorage.setItem('_tmptest', 'tmpval');
                window.localStorage.removeItem('_tmptest');
                return true;
            } catch (BogusQuotaExceededErrorOnIos5) {
                // error
            }
        }
        return false;
    }

    return ClientStorage;
})(jQuery);