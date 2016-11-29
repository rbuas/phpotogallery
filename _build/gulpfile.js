/////////////
// GULPFILE : project builder
///////
var gulp = require('gulp'); 
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var path = require('path');
var zip = require('gulp-zip');
var uglifyJS = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require("gulp-rename");

var builder = {
    DNA : require('./dna.json'),
    actions : {
        'default' : {
            action : function() { builder.man(); }, 
            tip : "builder manual"
        },
        'build' : {
            action : function() { builder.buildAll(); }, 
            tip : "build all less and js"
        },
        'style-build' : {
            action : function() { builder.buildStyle(); }, 
            tip : "build all less"
        },
        'style-watch' : {
            action : function() { builder.watchStyles(); }, 
            tip : "watch all less"
        },
        'js-build' : {
            action : function() { builder.buildJS(); }, 
            tip : "build all js"
        },
        'js-watch' : {
            action : function() { builder.watchJS(); }, 
            tip : "watch all js"
        }
    },
    process : {},

    initialize : function() {
        if(!builder || !builder.actions)
            return;

        console.log('Gulp initialize ...');
        for(var actionname in builder.actions) {
            if(!builder.actions.hasOwnProperty(actionname))
                continue;

            var aconfig = builder.actions[actionname];
            if(!aconfig || !aconfig.action)
                continue;

            gulp.task(actionname, aconfig.action);
        }
    },

    man : function () {
        if(!builder || !builder.actions)
            return;

        console.log('---------------------------------------');
        console.log('Actions manual :');
        console.log('---------------------------------------');
        for(var actionname in builder.actions) {
            if(!builder.actions.hasOwnProperty(actionname))
                continue;

            var aconfig = builder.actions[actionname];
            if(!aconfig || !aconfig.action)
                continue;

            var tab = (actionname.length > 7) ? "\t\t: " : "\t\t\t: ";
            console.log(actionname + tab, aconfig.tip);
        }
        console.log('---------------------------------------');
    },

    validate : function (action) {
        action = action || "";

        if(!builder.DNA) {
            console.error("Missing config file :-(");
            return false;
        }
        if(!builder.actions) {
            console.error("Missing actions section :-(");
            return false;
        }
        if(!builder.actions[action]) {
            console.error("Missing action " + action + " :-(");
            return false;
        }

        return true;
    },

    buildAll : function () {
        if(!builder.validate("build")) return;

        builder.buildStyle();
        builder.buildJS();
    },

    buildStyle : function (file) {
        if(!builder.validate("style-build")) return;

        builder.startProcess("buildstyle");
        return gulp.src(file || builder.DNA.skininput)
            .pipe(less().on('error', function(err) {
                console.log(err);
                this.emit('end');
            }))
            .pipe(minifyCSS())
            .pipe(gulp.dest(builder.DNA.skinoutput))
            .on('error', function(err) {
                console.log(err);
            })
            .on('end', function() {
                builder.endProcess("buildstyle");
            });
    },

    watchStyles : function () {
        if(!builder.validate("style-watch")) return;

        return gulp.watch(builder.DNA.skinfiles, function(event) {
            console.log('Builder::File ' + event.path + ' was ' + event.type + '...');
            return builder.buildStyle();
        });
    },

    buildJS : function () {
        if(!builder.validate("js-build")) return;

        builder.startProcess("buildjs");
        return gulp.src(builder.DNA.jsfiles)
            .pipe(uglifyJS({mangle:false}))
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(builder.DNA.jsoutput))
            .pipe(gulp.src(builder.DNA.jsmin))
            .pipe(concat(builder.DNA.jspack))
            .pipe(gulp.dest(builder.DNA.jspackoutput))
            .on('end', function() {
                builder.endProcess("buildjs");
            });
    },

    watchJS : function () {
        if(!builder.validate("js-watch")) return;

        return gulp.watch(builder.DNA.jsfiles, function(event) {
            console.log('Builder::File ' + event.path + ' was ' + event.type + '...');
            return builder.buildJS();
        });
    },

    startProcess : function(action) {
        if(!action || !builder || !builder.process)
            return;

        var start = new Date();
        builder.process[action] = start;
        var time = builder.formatDate(start);
        console.log("[" + time + "] Builder::Starting : '" + action + "' ...");
    },

    endProcess : function(action) {
        if(!action || !builder || !builder.process)
            return;

        var start = builder.process[action];
        builder.process[action] = null;
        delete builder.process[action];
        var end = new Date();
        var diff = Math.floor((end - start)/1000);
        var time = builder.formatDate(end);

        console.log("[" + time + "] Builder::Finished : '" + action + "' (" + diff + "s)");
    },

    formatDate : function(date) {
        if(!date)
            return "";

        var y = date.getFullYear();
        var M = (1 + date.getMonth());
        var d = date.getDate();
        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();

        if(M < 10) M = "0" + M;
        if(d < 10) d = "0" + d;

        return "" + y + M + d + ":" + h + ":" + m + ":" + s;
    },

    pack : function () {
        if(!builder.validate("pack")) return;

        return gulp.src('../*')
            .pipe(zip('pack.zip', false))
            .pipe(gulp.dest('dist'));
    }
}
builder.initialize();