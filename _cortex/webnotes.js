/////////////////////////////////////////////////////////////////
// WebNotes extends Cortex
// author: Rodrigo Buas - rodrigobuas@gmail.com - 20150621
/////////////////////////////////////////////////////////////////
WebNotes = (function ($, tracer, Cortex, browserext) {

    function WebNotes (options) {
        var _this = this;
        this.ready = false;

        var defaultOptions = {
            version : "201603300000",
            rootNote : "notes",
            module : "WebNotes"
        };

        this.options = $.extend({}, defaultOptions, options);

        Cortex.call(this, this.options);

        this.ready = true;
    };

    WebNotes.prototype = $.extend({}, Cortex.prototype, {

        noteGet : function(note) {
            var _this = this;
            return this.synapse("noteGet", [note]).then(
                function success (response) { 
                    if(_this.catchError(response)) return;
                    _this.updateData(Cortex.DATA.NOTE, {id:response.note, content:response.notecontent});
                },
                function error (error) { return _this.error(error); }
            );
        },

        noteSave : function(note, content) {
            var _this = this;
            return this.synapse("noteSave", [note, content]).then(
                function success (response) { 
                    if(_this.catchError(response)) return;
                    _this.updateData(Cortex.DATA.NOTE, {id:response.note, content:response.notecontent});
                },
                function error (error) { return _this.error(error); }
            );
        },

        noteList : function() {
            var _this = this;
            return this.synapse("noteList").then(
                function success (response) { 
                    if(_this.catchError(response)) return;
                    _this.updateData(Cortex.DATA.NOTELIST, response.notelist);
                },
                function error (error) { return _this.error(error); }
            );
        }
    });
    Cortex.prototype.constructor = Cortex;

    return WebNotes;
})(jQuery, tracer, Cortex, browserext);