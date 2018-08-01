var argv = require('yargs').argv;

var gulp = require('gulp');

// Plugins.
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var sass = require('gulp-sass');

var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var rename = require('gulp-rename');
var gulpif = require('gulp-if');

var header = require('gulp-header');
var pkg = require('./version.json');
var banner = ['/**',
  ' * @name <%= pkg.name %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.link %>',
  ' */',
  ''].join('\n');

// We only want to process our own non-processed JavaScript files.
var jsPaths = [
  './app/app.js',
  '!./app/config.js',
  '!./app/example.config.js',
  './app/**/**/**/*.js'
];
var jsAssetPaths = [
  './assets/lib/jquery-*.min.js',
  './assets/lib/angular.min.js',
  './assets/lib/*.js',
  './assets/modules/**/*.js'
];
var adminBuildDir = './assets/build';

/**
 * Run Javascript through JSHint.
 */
gulp.task('jshint', function() {
  return gulp.src(jsPaths)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

/**
 * Build single app.js file.
 */
gulp.task('js', function () {
  gulp.src(jsPaths)
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(gulpif(argv.production, uglify()))
    .pipe(rename({extname: ".min.js"}))
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest(adminBuildDir))
});

/**
 * Build single assets.js file.
 */
gulp.task('assets', function () {
  gulp.src(jsAssetPaths)
    .pipe(concat('assets.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename({extname: ".min.js"}))
    .pipe(gulp.dest(adminBuildDir))
});

/**
 * Watch files for changes and run tasks.
 */
gulp.task('default', function() {
  gulp.watch(jsPaths, ['js']);
  gulp.watch(jsAssetPaths, ['assets']);
});
