var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concatJS = require('gulp-concat');
var sass = require('gulp-sass');

gulp.task('concat-js', function () {
    gulp.src(['./app/Resources/javascript/jquery-2.1.4.min.js', './app/Resources/javascript/kinetic-v5.1.0.min.js', './app/Resources/javascript/objects.js'])
        .pipe(concatJS('scripts.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./web/javascript'));
});

gulp.task('sass', function () {
   gulp.src('./app/Resources/sass/styles.scss')
       .pipe(sass().on('error', sass.logError))
       .pipe(gulp.dest('./web/css/'));
});