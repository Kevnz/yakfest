var gulp = require('gulp'),
    browserify = require('browserify'),
    connect = require('gulp-connect');

var source = require('vinyl-source-stream');
var deploy = require('gulp-gh-pages'); 
var replace = function () {};//require('gulp-replace'); 
var del = require('delete');

gulp.task('connect', function() {
  connect.server({
    root: './public',
    livereload: true,
    port: 8080
  });
});

var webserver = require('gulp-webserver');

gulp.task('webserver', function() {
  gulp.src('./public')
    .pipe(webserver({
      livereload: true,
      directoryListing: true,
      open: true
    }));
});

gulp.task('browserify-dev', function () {
 
    return browserify({ entries:['./src/index.js'],debug: true })
        .transform('browserify-shim')
        .bundle()
        .on('error', function (e) {
            console.log('browserify error');
            console.log(arguments);
            throw e;
        })
        .pipe(source('app.js'))
        .pipe(gulp.dest('./public/js')) 
        .on('end', function () {
            console.log('ended');
        });
});

gulp.task('browserify-prod', function () {
 
    return browserify({ debug: true,entries:['./src/game.js']
        })
        .transform('es6ify')
        .transform('stripify')
        .transform( 'uglifyify')
        .bundle()
        .on('error', function () {
            console.log('browserify error');
            console.log(arguments);
        })
        .pipe(source('game.min.js'))
        .pipe(gulp.dest('./public/js')) 
        .on('end', function () {
            console.log('ended');
        });
});
gulp.task('purge', function (callback) {
    del.sync('./dist')
    callback(null);
 
});
gulp.task('move', ['browserify-dev'], function () {
    return gulp.src('./public/**/*.*')
        .pipe(gulp.dest('./dist'));
});
gulp.task('prep', ['move'], function () {
    return gulp.src('./dist/index.html')
        .pipe(replace(/game.js/g, 'game.min.js'))
        .pipe(gulp.dest('./dist'))
});
gulp.task('deploy', function () {
    return gulp.src('./dist/**/*')
        .pipe(deploy());
});

gulp.task('build' , ['browserify-dev','browserify-prod']);
gulp.task('dev' , ['browserify-dev']);

gulp.task('publish', ['purge', 'move'], function () { 

    return gulp.src('./dist/**/*')
        .pipe(deploy());});


gulp.task('dafiles', function () {
    return gulp.src('./public/*.html', './src/**/*.js')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['./public/*.html', './src/*.js', './src/**/*.js'], ['browserify-dev','dafiles']);
});


gulp.task('working', ['connect', 'watch']);
gulp.task('default' , ['build']);
