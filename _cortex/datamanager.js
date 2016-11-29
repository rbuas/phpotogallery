/////////////////////////////////////////////////////////////////
// DataManager
/////////////////////////////////////////////////////////////////
var DataManager = (function ($, tracer, ClientData) {
    var _DATA = {};
    _DATA.CUSTOMER_MAIL = "CustomerMail";
    var _defaultoptions = {
        mapping: {}
    };
    _defaultoptions.mapping[_DATA.CUSTOMER_MAIL] = "tf.customermail";

    function DataManager(options) {
        this.options = $.extend({}, _defaultoptions, options);
        this.gtm = this.options.gtm || [];
        this.data = new ClientData({ persistentData: [_defaultoptions.mapping[_DATA.CUSTOMER_MAIL]] });

        this.options.mapping = build2WaysMapping(this.options.mapping);
    };


    DataManager.prototype = {
        DATA: _DATA,

        connection: function (gtm) {
            if(gtm != null) this.gtm = gtm;
            return this.gtm;
        },

        set: function (property, value, safemode) {
            safemode = safemode != null ? safemode : true;
            if (!property)
                return false;

            var validvalue = value != "" && value != null && value != '0';
            if (safemode && !validvalue)
                return false;

            var mapped = mapKey(property, this.options.mapping);
            this.data.set(mapped, value);
            return true;
        },

        setValid: function (property, value) {
            var safemode = true;
            return this.set(property, value, safemode);
        },

        setValidObject: function (obj) {

            for (var key in obj) {
                if (!obj.hasOwnProperty(key))
                    continue;

                this.setValid(key, obj[key]);
            }
        },

        get: function (property) {
            var mapped = mapKey(property, this.options.mapping);
            var value = this.data.get(mapped);
            return value;
        },

        reset: function (property) {
            this.data.reset();
        },

        push: function(event, infos) {
            var datainfo = pickInfos(this.data.collection(), infos);
            if (!datainfo)
                return false;

            datainfo.event = event;
            var infomapped = mapNames(datainfo, this.options.mapping);
            var infocleaned = cleanInfo(infomapped);

            tracer.comm("DataManager::gtm : ", infocleaned);
            this.gtm.push(infocleaned);
        }
    };
    DataManager.prototype.constructor = DataManager;



    /////////////
    // PRIVATE
    ///////

    function mapNames(source, mapping) {
        if (!source || !mapping)
            return source;

        var converted = Object.keys(source).reduce(function (model, key) {
            model[mapKey(key, mapping)] = source[key];
            return model;
        }, {});
        return converted;
    }

    function mapKey(key, mapping) {
        return mapping && mapping[key] || key;
    }

    function pickInfos (source, infos) {
        if (!infos)
            return $.extend({}, source);

        var picked = Object.keys(source).reduce(function (model, key) {
            if (source[key] != null && infos.indexOf(key) >= 0) model[key] = source[key];
            return model;
        }, {});
        return picked;
    }

    function cleanInfo(source) {
        var cleaned = Object.keys(source).reduce(function (model, key) {
            if (source[key] != null) model[key] = source[key];
            return model;
        }, {});
        return cleaned;
    }

    function build2WaysMapping(mapping) {
        var m2w = {};
        for (var key in mapping) {
            if (!mapping.hasOwnProperty(key))
                continue;

            var value = mapping[key];
            m2w[key] = value;
            m2w[value] = key;
        }
        return m2w;
    }

    return new DataManager();
})(jQuery, tracer, ClientData)