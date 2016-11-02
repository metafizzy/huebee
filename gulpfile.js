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

// -------------------------- default -------------------------- //

gulp.task( 'default', [
  'requirejs',
  'uglify',
  'css',
]);
