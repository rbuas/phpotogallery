/////////////
/// Synapse
///////
Synapse = (function ($, tracer) {
    function Synapse (options) {
        var _this = this;
        var defaultOptions = {
            base : '/_synapse/',
            name : 'Synapse',
            asyncMode : true,
            defaultEndRequest : null,
            actions : {
                "getConnection" : "getconnection",
                "buildSite" : "buildsite",
                "buildAlbum" : "buildalbum",
                "reset" : "reset",
                "cleanSite" : "cleansite",
                "activeGuardian" : "activeguardian",
                "removeGuardian" : "removeguardian",
                "userCurrent" : "userCurrent",
                "userCreate" : "usercreate",
                "userConfirm" : "userconfirm",
                "userLogin" : "userlogin",
                "userLogout" : "userlogout",
                "userRetrievePassword" : "userretrievepassword",
                "userAddPassport" : "useraddpassport",
                "userRemovePassport" : "userremovepassport",
                "userAddFavorite" : "useraddfavorite",
                "userRemoveFavorite" : "userremovefavorite",
                "lang" : "lang",
                "noteGet" : "noteget",
                "noteSave" : "notesave",
                "noteList" : "notelist",
                "album" : "album",
                "library" : "library",
                "sendmail" : "sendmail",
                "admin" : "admin"
            }
        };

        this.options = $.extend({}, defaultOptions, options);
        this.waiting = 0;
    }

    Synapse.prototype = {
        getUrl : function(action) {
            if(!action)
                return;

            var path = this.options.actions[action];
            if(!path) {
                tracer.error('Synapse::getUrl: can not find the action path to : ', action);
                return;
            }

            var base =  this.options.base || '';
            return base + path;
        },

        request : function(url, method, data) {
            if(!url)
                return;

            tracer.comm(this.options.name + "::Request : ", {
                url:url, 
                method:method, 
                data:data, 
                async:this.options.asyncMode
            });

            this.startRequest();

            var _this = this;
            return $.ajax({
                url: url,
                //cache: false,
                dataType: 'json',
                //contentType: 'application/json; charset=utf-8',
                //data : (data != null) ? JSON.stringify(data) : null,
                data : data,
                async: this.options.asyncMode,
                type: method,
                success: function (data, success) {
                    tracer.comm(_this.options.name + "::Response (" + url + "): ", data);

                    var response;
                    if (data) {
                         response = formatResponse(data);
                    } else {
                        tracer.error("Synapse::request: server data.", data);
                        response = formatResponse({error:"Error on server data."});
                    }

                    _this.endRequest();
                    return response;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    tracer.comm(_this.options.name + "::Response (" + url + ") ERROR :", errorThrown);

                    var response = formatResponse(
                        {
                            error : "Error on request communication.", 
                            errorInfo : {
                                request : url, 
                                handler : XMLHttpRequest, 
                                status : textStatus, 
                                error : errorThrown
                            }
                        }
                    );

                    _this.endRequest();
                    return response;
                } 
            });
        },

        get : function(url) {
            // call get request
            return this.request(url, "GET", null);
        },

        post : function(url, data) {
            // call post request
            return this.request(url, "POST", data);
        },

        load : function(filename) {
            tracer.comm(this.options.name + "::loadfile: ", filename);
            var _this = this;
            return $.ajax({
                url: filename,
                contentType: "application/json; charset=utf-8",
                dataType : "json",
                success: function (data) {
                    tracer.comm(_this.options.name + "::loadfile::Response (" + filename + "): ", data);
                    return data;
                },
                error: function (xhr, status, error) {
                    tracer.error(_this.options.name + "::loadfile::Response (" + filename + ") ERROR :", error);
                    return error;
                }
            });
        },

        startRequest : function() {
            //increment request waiting
            this.waiting = this.waiting + 1;
        },

        endRequest : function() {
            this.waiting = this.waiting - 1;
            if(this.options.defaultEndRequest)
                this.options.defaultEndRequest();
        },

        connect : function(slug) {
            var synapse  = this.getUrl("getConnection");
            if(!synapse)
                return false;

            var params = slug ? "?slug=" + slug : "";
            return this.get(synapse + params);
        },

        buildSite : function() {
            var synapse  = this.getUrl("buildSite");
            if(!synapse)
                return false;

            return this.get(synapse);
        },

        buildAlbum : function(slug) {
            var synapse  = this.getUrl("buildAlbum");
            if(!synapse)
                return false;

            return this.post(synapse, {slug:slug});
        },

        reset : function() {
            var synapse  = this.getUrl("reset");
            if(!synapse)
                return false;

            return this.get(synapse);
        },

        cleanSite : function() {
            var synapse  = this.getUrl("cleanSite");
            if(!synapse)
                return false;

            return this.get(synapse);
        },

        activeGuardian : function (text) {
            var synapse  = this.getUrl("activeGuardian");
            if(!synapse)
                return false;

            return this.post(synapse, {text:text});
        },

        removeGuardian : function () {
            var synapse  = this.getUrl("removeGuardian");
            if(!synapse)
                return false;

            return this.get(synapse);
        },

        userCurrent : function() {
            var synapse = this.getUrl("userCurrent");
            if(!synapse)
                return false;

            return this.get(synapse);
        },

        userCreate : function(email, password, news, lang) {
            var synapse  = this.getUrl("userCreate");
            if(!synapse)
                return false;

            return this.post(synapse, {email:email, password:password, news:news, lang:lang});
        },

        userConfirm : function(email, token) {
            var synapse  = this.getUrl("userConfirm");
            if(!synapse)
                return false;

            return this.post(synapse, {email:email, token:token});
        },

        userLogin : function(email, password) {
            var synapse  = this.getUrl("userLogin");
            if(!synapse)
                return false;

            return this.post(synapse, {email:email, password:password});
        },

        userLogout : function(callback) {
            var synapse  = this.getUrl("userLogout");
            if(!synapse)
                return false;

            return this.get(synapse);
        },

        userRetrievePassword : function(email) {
            var synapse  = this.getUrl("userRetrievePassword");
            if(!synapse)
                return false;

            return this.post(synapse, {email:email});
        },

        userAddPassport : function(email, slug) {
            var synapse  = this.getUrl("userAddPassport");
            if(!synapse)
                return false;

            return this.post(synapse, {email:email, slug:slug});
        },

        userRemovePassport : function(email, slug) {
            var synapse  = this.getUrl("userRemovePassport");
            if(!synapse)
                return false;

            return this.post(synapse, {email:email, slug:slug});
        },

        userAddFavorite : function(slug) {
            var synapse  = this.getUrl("userAddFavorite");
            if(!synapse)
                return false;

            return this.post(synapse, {slug:slug});
        },

        userRemoveFavorite : function(slug) {
            var synapse  = this.getUrl("userRemoveFavorite");
            if(!synapse)
                return false;

            return this.post(synapse, {slug:slug});
        },

        lang : function(lang) {
            var synapse  = this.getUrl("lang");
            if(!synapse)
                return false;

            return this.post(synapse, {lang:lang});
        },

        noteGet : function(note) {
            var synapse  = this.getUrl("noteGet");
            if(!synapse)
                return false;

            return this.post(synapse, {note:note});
        },

        noteSave : function(note, content) {
            var synapse  = this.getUrl("noteSave");
            if(!synapse)
                return false;

            return this.post(synapse, {note:note, content:content});
        },

        noteList : function(callback) {
            var synapse  = this.getUrl("noteList");
            if(!synapse)
                return false;

            return this.get(synapse);
        },

        album : function(slug) {
            var synapse  = this.getUrl("album");
            if(!synapse)
                return false;

            return this.post(synapse, {slug:slug});
        },

        library : function(filter) {
            var synapse  = this.getUrl("library");
            if(!synapse)
                return false;

            return this.post(synapse, {filter:filter});
        },

        sendMail : function(to, subject, content) {
            var synapse  = this.getUrl("sendmail");
            if(!synapse)
                return false;

            return this.post(synapse, {to:to, subject:subject, content:content});
        },

        admin : function() {
            var synapse  = this.getUrl("admin");
            if(!synapse)
                return false;

            return this.get(synapse);
        }

    }


    /////////////
    // PRIVATE
    ///////
    function formatResponse (response) {

        return response;
    }

    return Synapse;
})(jQuery, tracer);