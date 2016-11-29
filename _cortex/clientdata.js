/////////////////////////////////////////////////////////////////
// ClientData
/////////////////////////////////////////////////////////////////

ClientData = (function ($, tracer) {

    /**************
    * @class ClientStorage
    *******/
    function ClientData (options) {
        var defaults = {readonly : false, initialData : {}};

        this.options = $.extend({}, defaults, options);

        ClientStorage.call(this, this.options);

        this.load();

        var self = this;
        function unload() {
            if(self.options.readonly)
                return;

            tracer.message("ClientData::onunload", self);
            self.save();
        }

        // page unload event
        if (window.addEventListener) window.addEventListener("unload", unload, false);
        else if (window.attachEvent) window.attachEvent("onunload", unload);
        else window.onunload = unload;
    }

    ClientData.prototype = $.extend({}, ClientStorage.prototype, {

        addDataSourceListener : function(key, dataCallback) {
            var self = this;

            if(!key || !dataCallback) 
                return;

            var listener = function () {
                var filteredModel = dataCallback();
                self.set( key, filteredModel );
                self.save();
            };

            // page unload event
            if (window.addEventListener) window.addEventListener("unload", listener, false);
            else if (window.attachEvent) window.attachEvent("onunload", listener);
            else window.onunload = listener;
        }
    });
    ClientData.prototype.constructor = ClientData;

    return ClientData;
})(jQuery, tracer);