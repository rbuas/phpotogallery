(function ($) {

    Array.prototype.unique = function(a){
        return function(){ return this.filter(a) }
    }(function(a,b,c){ return c.indexOf(a,b+1) < 0 });

})(jQuery);