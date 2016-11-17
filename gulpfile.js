/* jshint node: true, unused: true, undef: true */

var gulp = require('gulp');
var rjsOptimize = require('gulp-requirejs-optimize');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var fs = require('fs');

// -------------------------- requireJS -------------------------- //

// regex for banner comment
var reBannerComment = new RegExp('^\\s*(?:\\/\\*[\\s\\S]*?\\*\\/)\\s*');

var banner;

function getBanner() {
  if ( banner ) {
    return banner;
  }
  var src = fs.readFileSync( 'huebee.js', 'utf8' );
  var matches = src.match( reBannerComment );
  banner = matches[0].replace( 'Huebee', 'Huebee PACKAGED' );
  return banner;
}

function addBanner() {
  var bann = getBanner();
  return replace( /^/, bann );
}

gulp.task( 'requirejs', function() {
  return gulp.src('huebee.js')
    .pipe( rjsOptimize({
      baseUrl: 'node_modules',
      optimize: 'none',
      include: [
        '../huebee.js',
      ],
    }) )
    // remove named module
    .pipe( replace( "'../huebee.js',", '' ) )
    // add banner
    .pipe( addBanner() )
    .pipe( rename('huebee.pkgd.js') )
    .pipe( gulp.dest('dist') );
});

// -------------------------- uglify -------------------------- //

var uglify = require('gulp-uglify');

gulp.task( 'uglify', [ 'requirejs' ], function() {
  gulp.src('dist/huebee.pkgd.js')
    .pipe( uglify() )
    // add banner
    .pipe( addBanner() )
    .pipe( rename('huebee.pkgd.min.js') )
    .pipe( gulp.dest('dist') );
});

// -------------------------- css -------------------------- //

var cleanCSS = require('gulp-clean-css');

gulp.task( 'css', function() {
  gulp.src('huebee.css')
    // copy to dist
    .pipe( gulp.dest('dist') )
    // minify
    .pipe( cleanCSS({ advanced: false }) )
    .pipe( rename('huebee.min.css') )
    .pipe( replace( '*/', '*/\n' ) )
    .pipe( gulp.dest('dist') );
});

// ----- hint ----- //

var jshint = require('gulp-jshint');

gulp.task( 'hint-js', function() {
  return gulp.src('js/huebee.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
});

gulp.task( 'hint-test', function() {
  return gulp.src('test/unit/*.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
});

gulp.task( 'hint-task', function() {
  return gulp.src('gulpfile.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
});

var jsonlint = require('gulp-json-lint');

gulp.task( 'jsonlint', function() {
  return gulp.src( '*.json' )
    .pipe( jsonlint() )
    .pipe( jsonlint.report('verbose') );
});

gulp.task( 'hint', [ 'hint-js', 'hint-test', 'hint-task', 'jsonlint' ]);

// ----- version ----- //

// set version in source files

var minimist = require('minimist');
var gutil = require('gulp-util');
var chalk = gutil.colors;

// use gulp version -t 1.2.3
gulp.task( 'version', function() {
  var args = minimist( process.argv.slice(3) );
  var version = args.t;
  if ( !version || !/\d\.\d\.\d/.test( version ) ) {
    gutil.log( 'invalid version: ' + chalk.red( version ) );
    return;
  }
  gutil.log( 'ticking version to ' + chalk.green( version ) );

  function sourceReplace() {
    return replace( /Huebee v\d\.\d+\.\d+/, 'Huebee v' + version );
  }

  gulp.src([ 'huebee.js', 'huebee.css' ])
    .pipe( sourceReplace() )
    .pipe( gulp.dest('') );

  gulp.src( [ 'package.json' ] )
    .pipe( replace( /"version": "\d\.\d+\.\d+"/, '"version": "' + version + '"' ) )
    .pipe( gulp.dest('.') );
});

// -------------------------- default -------------------------- //

gulp.task( 'default', [
  'hint',
  'requirejs',
  'uglify',
  'css',
]);
