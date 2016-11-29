(function ($) {

    Array.prototype.unique = function(a){
        return function(){ return this.filter(a) }
    }(function(a,b,c){ return c.indexOf(a,b+1) < 0 });

    window.ArrayMatchAny = function (items, search) {
        if(!items || !search)
            return false;

        search = Array.isArray(search) ? search : [search];
        items = Array.isArray(items) ? items : [items];

        for(var i = 0 ; i < items.length; i++) {
            var item = items[i];
            if(item && search.indexOf(item) >= 0)
                return true;
        }

        return false;
    }

    window.ObjectPick = function (obj, list) {
        if(!obj || !list || (!list.black && !list.white))
            return obj;

        var pick = {};
        Object.keys(obj).map(function(key) {
            if(list.black && list.black.indexOf(key) >= 0)
                return;

            if(list.white && list.white.indexOf(key) < 0)
                return;

            pick[key] = obj[key];
        });
        return pick;
    }

    window.ObjectSubPath = function (obj, path) {
        if(!obj || !path || path == "/" || path == "")
            return obj;

        var splitpath = path.split("/");

        target = obj;
        for(var p in splitpath) {
            if(!splitpath.hasOwnProperty(p))
                continue;

            var key = splitpath[p];
            if(!key)
                continue;

            if(!target[key])
                return null;

            target = target[key];
        }
        return target;
    }

    window.lazyAction = function (action, timer) {
        timer = timer != null ? timer : 0;
        if(!action && typeof(action) != "function")
            return false;

        var _action = action;
        setTimeout(function() { _action(); }, timer);
    }

    window.viewRefresh = function () {
        //$("body").css('min-height', window.innerHeight); //screen.height
        $(".viewport-minheight").css('min-height', window.innerHeight); //screen.height
        $(".viewport-height").css('height', window.innerHeight); //screen.height
        $(".pagefix").css('height', window.innerHeight); //screen.height
    }
})(jQuery);