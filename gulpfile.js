const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const browserify = require('browserify');
const source = require('vinyl-source-stream');


// Build the demo by default
gulp.task('default', ['demo-js', 'demo-3dobjects', 'demo-misc'], function() {});

// Recompile files as they change
gulp.task('watch', function() {

    gulp.watch(['./src/**/*.js'], ['demo-js']);
    gulp.watch(['./src/3dobjects/**/*.*'], ['demo-3dobjects']);
    gulp.watch(['./src/demo/index.html', './src/demo/styles/**/*.*', './src/demo/images/**/*.*'], ['demo-misc']);
});

// Compile JS
gulp.task('demo-js', function() {

    browserify('./src/demo/app-demo.js')
        .transform('babelify', {presets: ['es2015']})
        .bundle()
        .pipe(source('app-demo.js'))
        .pipe(gulp.dest('./build/'));
});

// Copy 3D models
// Separate task, because sometimes gulp doesn't copy some files from two .piped src's
gulp.task('demo-3dobjects', function() {

    return gulp.src([
        './src/3dobjects/**/*.*'
    ], {base: './src/'})
        .pipe(gulp.dest('build'));
});

// Copy other static files
gulp.task('demo-misc', function() {

    return gulp.src([
        './src/demo/index.html',
        './src/demo/styles/**/*.css',
        './src/demo/images/**/*.*'
    ], {base: './src/demo/'})
        .pipe(gulp.dest('build'));
});