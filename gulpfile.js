'use strict';
// Generated on 2014-04-14 using generator-leaflet 0.0.14

var gulp = require('gulp');
var open = require('open');
var wiredep = require('wiredep').stream;
var port = 9820; // @custom

var paths = {
    appDir: 'app/',
    buildDir: 'dist/',
    scripts: {
        dir: 'app/scripts/',
        src:  'app/scripts/**/*.js',
        dest: 'dist/js'
    },
    styles: {
        dir: 'app/styles/',
        src:  'app/styles/**/*.scss',
        dest: 'dist/styles'
    },
    images: {
        dir: 'app/images',
        src: 'app/images/**/*',
        dest: 'dist/images',
    }
};


var gulp = require('gulp');
var sass = require('gulp-sass');

// Load plugins
var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
    gulp.src([paths.styles.src])
        .pipe(sass({
            style: 'expanded',
            errLogToConsole: true
        }))
        .pipe(gulp.dest(paths.styles.dir));
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src([paths.scripts.src])
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('default'))
        .pipe($.size());
});

// HTML
gulp.task('html', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src('app/*.html')
        .pipe($.useref.assets())
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

// Images
gulp.task('images', function () {
    return gulp.src([
    		'app/images/**/*',
    		'app/lib/images/*'])
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

// Data
gulp.task('data', function () {
    return gulp.src([
            paths.scripts.dir + '/**/*.csv',
            paths.scripts.dir + '/**/*.json'])
        .pipe(gulp.dest('dist/scripts'))
        .pipe($.size());
});

// Fonts
gulp.task('fonts', function() {
    return gulp.src([
                    'app/bower_components/font-awesome/fonts/fontawesome-webfont.*'])
            .pipe(gulp.dest('dist/fonts/'));
});

// Clean
gulp.task('clean', function () {
    return gulp.src(['dist/styles', 'dist/scripts', 'dist/images'], { read: false }).pipe($.clean());
});

// Build
gulp.task('build', ['html', 'images', 'data', 'fonts']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// Connect
gulp.task('connect', $.connect.server({
    root: ['app'],
    port: port,
    livereload: true
}));

// Open
gulp.task('serve', ['connect'], function() {
  open("http://localhost:"+port);
});

// Inject Bower components
gulp.task('wiredep', function () {
    gulp.src('app/styles/*.css')
        .pipe(wiredep({
            directory: 'app/bower_components',
            ignorePath: 'app/bower_components/'
        }))
        .pipe(gulp.dest(paths.styles.dir));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components',
            ignorePath: paths.appDir
        }))
        .pipe(gulp.dest('app'));
});

// Watch
gulp.task('watch', ['connect', 'serve'], function () {
    // Watch for changes in `app` folder
    gulp.watch([
        'app/*.html',
        paths.styles.src,
        paths.scripts.src,
        paths.images.src
    ], function (event) {
    	console.log('reload');
        return gulp.src(event.path)
            .pipe($.connect.reload());
    });

    // Watch .scss files
    gulp.watch(paths.styles.src, ['styles']);

    // Watch .js files
    gulp.watch(paths.scripts.src, ['scripts']);

    // Watch image files
    gulp.watch(paths.images.src, ['images']);

    // Watch bower files
    gulp.watch('bower.json', ['wiredep']);
});
