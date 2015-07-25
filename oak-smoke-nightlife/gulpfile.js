var gulp = require('gulp');
var gutil = require('gulp-util');

var concat = require('gulp-concat');
var cssmin = require('gulp-minify-css');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');


gulp.task('styles', function(){
    return gulp.src('./public/scss/*.sass')
        .pipe(sass())
        .pipe(gulp.dest('./public/stylesheets/'))
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./public/stylesheets/'));
});

gulp.task('watch', function(){
    gulp.watch('./public/scss/*.sass', ['styles']);
});

gulp.task('default', ['styles']);