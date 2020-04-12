const fs = require('fs');
const path = require('path');
const version = require('../package.json').version;

function dir( file ) {
  return path.resolve( __dirname, file );
}

[ '../huebee.js', '../huebee.css' ].forEach( function( file ) {
  let src = fs.readFileSync( dir( file ), 'utf8' );
  src = src.replace( /Huebee v\d+\.\d+\.\d+/, `Huebee v${version}` );
  fs.writeFileSync( dir( file ), src, 'utf8' );
} );
