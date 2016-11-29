goToCard = (function ($, tracer, cortex) {
    var _scrolltimer;
    var _scrollduration = 200;
    var _scroldelay = 1;
    var _scrolling = false;
    var _effect = "easeInOutBack";//swing
    var _bindmouseevent = false;
    var _bindkeyevent = true;

    if(_bindmouseevent) {
        $(window).bind('mousewheel', function(event) {
            if (event.originalEvent.wheelDelta >= 0) {
                // prev card
                if(goToCard("prev")) {
                    event.preventDefault();
                }
            }
            else {
                // next card
                if(goToCard("next")) {
                    event.preventDefault();
                }
            }
        });
    }

    if(_bindkeyevent) {
        $(window).keydown(function(e) {
            var keyCode = e.keyCode;
            if (keyCode == 38 || keyCode == 33) {
                // prev card
                if(goToCard("prev")) {
                    event.preventDefault();
                }
            }
            else if (keyCode == 40 || keyCode == 34) {
                // next card
                if(goToCard("next")) {
                    event.preventDefault();
                }
            }
        });
    }

    function getCardsInPage () {
        var cards = $(".card");
        if(!cards || cards.length == 0)
            return;

        return cards;
    }

    function getCardTarget (direction) {
        var cards = getCardsInPage();
        if(!cards)
            return false;

        var vpHeight = $(window).height();
        var vpTop = $(window).scrollTop();
        var vpBottom = vpTop + vpHeight;
        var vpCenter = vpTop + vpHeight/2;
        var tolerance = 0.1 * (vpHeight);
        direction = direction != null ? direction : "next";
        if(direction != "prev" && direction != "next")
            return;

        var minDistance = null;
        var target = null;
        for(var c = 0; c < cards.length; c++) {
            var card = cards[c];
            if(!card)
                continue;

            var top = card.offsetTop;
            var bottom = top + card.offsetHeight;

            if(direction == "prev") {
                if(top < vpTop - vpHeight - tolerance || top > vpTop - tolerance)
                    continue;
            } else { //next
                if(top < vpTop + tolerance || top > vpBottom + tolerance)
                    continue;
            }

            var distance = Math.abs(vpCenter - top);
            if(minDistance == null || distance < minDistance) {
                minDistance = distance;
                target = card;
            }
        }
        return target;
    }

    function goToCard (direction) {
        if(_scrolling)
            return;

        var target = getCardTarget(direction);
        if(!target)
            return false;

        clearTimeout(_scrolltimer);
        if(!_scrolling) _scrolltimer = setTimeout(function(){
            _scrolling = true;
            $("body").stop().animate({scrollTop: target.offsetTop}, _scrollduration, _effect, function() {
                _scrolling = false;
            });
        },_scroldelay);
        return true;
    }

    return goToCard;
})(jQuery, tracer, cortex);