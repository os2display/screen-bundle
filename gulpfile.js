var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var rename = require('gulp-rename');
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
  'Resources/public/app/fakeOffline.js',
  'Resources/public/app/app.js',
  'Resources/public/app/*.js'
];
var jsAssetPaths = [
  'Resources/public/assets/lib/jquery-*.min.js',
  'Resources/public/assets/lib/angular.min.js',
  'Resources/public/assets/lib/*.js'
];
var adminBuildDir = 'Resources/public/assets/build';

var jsAdminPaths = [
  'Resources/public/apps/**/**/**/*.js'
];

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
gulp.task('js', function (done) {
  gulp.src(jsPaths)
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename({extname: ".min.js"}))
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest(adminBuildDir));

  gulp.src(jsAdminPaths)
  .pipe(concat('os2displayscreen.js'))
  .pipe(ngAnnotate())
  .pipe(uglify())
  .pipe(rename({extname: ".min.js"}))
  .pipe(header(banner, { pkg : pkg } ))
  .pipe(gulp.dest(adminBuildDir));

  done();
});

/**
 * Build single assets.js file.
 */
gulp.task('assets', function (done) {
  gulp.src(jsAssetPaths)
    .pipe(concat('assets.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename({extname: ".min.js"}))
    .pipe(gulp.dest(adminBuildDir));

  done();
});
