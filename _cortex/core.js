function ArrayMatchAny (items, search) {
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

function ObjectPick (obj, list) {
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

function lazyAction (action, timer) {
    timer = timer != null ? timer : 0;
    if(!action && typeof(action) != "function")
        return false;

    var _action = action;
    setTimeout(function() { _action(); }, timer);
}

Mobile = {
    webos: navigator.userAgent.match(/webOS/i),
    android: navigator.userAgent.match(/Android/i),
    blackBerry: navigator.userAgent.match(/BlackBerry/i),
    ios: navigator.userAgent.match(/iPhone|iPad|iPod/i),
    opera: navigator.userAgent.match(/Opera Mini/i),
    windows: navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i) || navigator.userAgent.match(/Windows Phone/i)
};

function IsMobile () {
    return (Mobile.webos || Mobile.android || Mobile.blackBerry || Mobile.ios || Mobile.opera || Mobile.windows);
}

function viewRefresh () {
    //$("body").css('min-height', window.innerHeight); //screen.height
    $(".viewport-minheight").css('min-height', window.innerHeight); //screen.height
    $(".viewport-height").css('height', window.innerHeight); //screen.height
    $(".pagefix").css('height', window.innerHeight); //screen.height
}