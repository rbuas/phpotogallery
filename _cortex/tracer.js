tracer = (function($) {
    Tracer  = {
        LEVEL_ERROR : 'E',
        LEVEL_WARNING : 'W',
        LEVEL_MESSAGE : 'M',
        LEVEL_COMM : 'C',
        LEVEL_ALL : '*',
        LEVEL_DISABLED : 'D',

        setLevel : function (level) {
            this.level = level;
        },

        isLevelActive : function (level) {
            if(!level || !this.level)
                return false;

            if(this.level == this.LEVEL_ALL)
                return true;

            return this.level.indexOf(level) >= 0;
        },

        log : function ( level, msg, obj, force ) {
            if(!msg)
                return;

            if(!force && !this.isLevelActive(level))
                return;

            console.log(this.levelBegin(level) + msg, this.levelEnd(level), obj);
        },

        comm : function ( msg, obj, force ) {
            return this.log(this.LEVEL_COMM, msg, obj, force);
        },

        message : function ( msg, obj, force ) {
            return this.log(this.LEVEL_MESSAGE, msg, obj, force);
        },

        error : function ( error, obj, force ) {
            return this.log(this.LEVEL_ERROR, error, obj, force);
        },

        warning : function ( warning, obj, force ) {
            return this.log(this.LEVEL_WARNING, warning, obj, force);
        },

        levelBegin : function (level) {
            switch(level) {
                case(this.LEVEL_ERROR): return '%c ERROR : ';
                case(this.LEVEL_WARNING): return '%c WARNING : ';
            }
            return '';
        },

        levelEnd : function (level) {
            switch(level) {
                case(this.LEVEL_ERROR): return 'color: #ff1515;';
                case(this.LEVEL_WARNING): return 'color: #AA8E39;';
            }
            return '';
        }
    };

    Tracer.setLevel(Tracer.LEVEL_ERROR + Tracer.LEVEL_WARNING);

    return Tracer;
})(jQuery);