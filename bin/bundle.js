const CleanCss = require('clean-css');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function dir( file ) {
  return path.resolve( __dirname, file );
}

// ----- concatenate JS ----- //

const huebeeJsFile = dir('../huebee.js');

const jsFiles = [
  dir('../node_modules/ev-emitter/ev-emitter.js'),
  dir('../node_modules/unipointer/unipointer.js'),
  huebeeJsFile,
];

// get banner
let huebeeJsSrc = fs.readFileSync( huebeeJsFile, 'utf8' );
let banner = huebeeJsSrc.split(' */')[0] + ' */\n\n';
banner = banner.replace( 'Huebee', 'Huebee PACKAGED' );

const pkgdJsFile = dir('../dist/huebee.pkgd.js');
// TODO use process.stdin, rather than writing/reading files
execSync(`cat ${jsFiles.join(' ')} > ${pkgdJsFile}`);
let pkgdJsSrc = fs.readFileSync( pkgdJsFile, 'utf8' );
// shim-in RequireJS definitions; requireJS task could do this but *eye roll*
let replaceDefineCount = 0;
const defineReplacements = [
  "define( 'ev-emitter/ev-emitter',",
  "define( 'unipointer/unipointer',",
];
pkgdJsSrc = pkgdJsSrc.replace( /define\( /g, function( original ) {
  let defineReplacement = defineReplacements[ replaceDefineCount ];
  replaceDefineCount++;
  return defineReplacement || original;
} );
fs.writeFileSync( pkgdJsFile, banner + pkgdJsSrc );

// ----- minify CSS ----- //

let srcCss = fs.readFileSync( dir('../huebee.css') );
let minifiedCss = new CleanCss().minify( srcCss ).styles.replace( '*/', '*/\n' );
fs.writeFileSync( dir('../dist/huebee.min.css'), minifiedCss );
