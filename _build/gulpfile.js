// Include gulp
var gulp = require('gulp'); 
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var path = require('path');
var zip = require('gulp-zip');
var deployFtp = require('gulp-deploy-ftp');

var wake = {
    DNA : require('./dna.json'),

    validate : function (action) {
        action = action || "";
        console.log("wake." + action);
        if(!wake.DNA) {
            console.error("Missing DNA :-(");
            return false;
        }

        return true;
    },

    buildAll : function () {
        if(!wake.validate("default")) return;

        return wake.buildSkin();
    },

    buildSkin : function () {
        if(!wake.validate("skin")) return;

        return gulp.src(wake.DNA.skininput)
          .pipe(less().on('error', function(err) {
              console.log(err);
              this.emit('end');
          }))
          .pipe(minifyCSS())
          .pipe(gulp.dest(wake.DNA.skinoutput));
    },

    watchSkins : function () {
        if(!wake.validate("skin-watch")) return;

        return gulp.watch(wake.DNA.skinfiles, function(event) {
          console.log('File ' + event.path + ' was ' + event.type + '...');
          return wake.buildSkin();
        });
    },

    pack : function () {
        if(!wake.validate("pack")) return;

        return gulp.src('../*')
            .pipe(zip('pack.zip', false))
            .pipe(gulp.dest('dist'));
    },

    deploy : function() {
        if(!wake.validate("deploy")) return;

        var options = {
            user: wake.DNA.ftp_username,
            password: wake.DNA.ftp_password,
            port: wake.DNA.ftp_port,
            host: wake.DNA.ftp_host,
            uploadPath: wake.DNA.ftp_path
        };

        var files = "";
        return gulp.src(files)
           .pipe(deployFtp(options))
           .pipe(gulp.dest('dest'));
    }
}

gulp.task('default', function() {  return wake.buildAll(); });

gulp.task('skin', function() { return wake.buildSkin(); });

gulp.task('skin-watch', function() { return wake.watchSkins(); });

gulp.task('pack', function() { return wake.pack(); });