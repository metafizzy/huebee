/*jshint browser: true, unused: true, undef: true */
/*globals Unipointer, EvEmitter */

function Huebee( anchor, options ) {
  this.anchor = anchor;
  // options
  this.options = {};
  this.option( Huebee.defaults );
  this.option( options );
  // kick things off
  this.create();
}

Huebee.defaults = {
  shades: 5,
  saturations: 3,
  gridSize: 15,
  mode: 'hsl',
  setText: true,
  setBGColor: false,
};

var proto = Huebee.prototype = Object.create( EvEmitter.prototype );

proto.option = function( options ) {
  this.options = extend( this.options, options );
};

var svgURI = 'http://www.w3.org/2000/svg';

proto.create = function() {
  var gridSize = this.options.gridSize;
  // open events
  this.isInputAnchor = this.anchor.nodeName == 'INPUT';
  this.anchor.addEventListener( 'click', this.open.bind( this ) );
  if ( this.isInputAnchor ) {
    this.anchor.addEventListener( 'focus', this.open.bind( this ) );
  }
  // create element
  var element = this.element = document.createElement('div');
  element.className = 'huebee ';
  element.className += this.options.className || '';
  // create container
  var container = this.container = document.createElement('div');
  container.className = 'huebee__container';
  // create canvas
  this.canvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.canvas.className = 'huebee__canvas';
  var shades = this.options.shades;
  var sats = this.options.saturations;
  this.canvas.width = gridSize * 14;
  this.canvas.height = gridSize * shades * sats;
  this.renderColors();
  // canvas pointer events
  var canvasPointer = this.canvasPointer = new Unipointer();
  canvasPointer._bindStartEvent( this.canvas );
  canvasPointer.on( 'pointerDown', this.canvasPointerDown.bind( this ) );
  canvasPointer.on( 'pointerMove', this.canvasPointerMove.bind( this ) );
  container.appendChild( this.canvas );
  // create cursor
  this.cursor = document.createElement('div');
  this.cursor.className = 'huebee__cursor';
  this.cursor.style.width = this.cursor.style.height = gridSize + 'px';
  container.appendChild( this.cursor );
  // create close button
  var svg = document.createElementNS( svgURI, 'svg');
  svg.setAttribute( 'class', 'huebee__close-button' );
  svg.setAttribute( 'viewBox', '0 0 24 24' );
  var path = document.createElementNS( svgURI, 'path');
  path.setAttribute( 'd', 'M 7,7 L 17,17 M 17,7, L 7,17' );
  path.setAttribute( 'class', 'huebee__close-button__x' );
  svg.appendChild( path );
  svg.addEventListener( 'click', this.close.bind( this ) );
  container.appendChild( svg );
  element.appendChild( container );
  // set relative position on parent
  var parentStyle = getComputedStyle( this.anchor.parentNode );
  if ( parentStyle.position != 'relative' && parentStyle.position != 'absolute' ) {
    this.anchor.parentNode.style.position = 'relative';
  }
  // event
  this.onDocPointerDown = this.docPointerDown.bind( this );
};

proto.renderColors = function() {
  var ctx = this.ctx;
  var gridSize = this.options.gridSize;
  var shades = this.options.shades;
  var sats = this.options.saturations;
  this.renderColorGrid( 1 );
  // saturations
  for ( var i=1; i < sats; i++ ) {
    ctx.save();
    ctx.translate( 0, gridSize * shades * i );
    var sat = 1 - i/sats;
    this.renderColorGrid( sat );
    ctx.restore();
  }

  // grays
  var moder = this.getColorModer();
  for ( i=0; i < shades+2; i++ ) {
    var lum = 1 - i/(shades+1);
    this.ctx.fillStyle = moder( 0, 0, lum );
    this.ctx.fillRect( gridSize * 13, i * gridSize, gridSize, gridSize );
  }

};


proto.renderColorGrid = function( sat ) {
  // var count = 7;
  var shades1 = this.options.shades + 1;
  var gridSize = this.options.gridSize;
  var moder = this.getColorModer();

  for ( var row = 1; row < shades1; row++ ) {
    for ( var col = 0; col < 12; col++ ) {
      var hue = col * 30;
      var lum = 1 - row / shades1;
      this.ctx.fillStyle = moder( hue, sat, lum );
      var x = gridSize * col;
      var y = gridSize * (row-1);
      this.ctx.fillRect( x, y, gridSize, gridSize );
    }
  }
};

var colorModers = {
  hsl: function( h, s, l ) {
    s = Math.round( s * 100 );
    l = Math.round( l * 100 );
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
  },
  hex: hsl2hex,
  'roundHex': function( h, s, l ) {
    var hex = hsl2hex( h, s, l );
    return roundHex( hex );
  }
};

proto.getColorModer = function() {
  return colorModers[ this.options.mode ] || colorModers.hsl;
};

// ----- events ----- //

var docElem = document.documentElement;

proto.open = function() {
  if ( this.isOpen ) {
    return;
  }
  this.element.style.left = this.anchor.offsetLeft + 'px';
  this.element.style.top = this.anchor.offsetTop + this.anchor.offsetHeight +
    'px';
  docElem.addEventListener( 'mousedown', this.onDocPointerDown );
  docElem.addEventListener( 'touchstart', this.onDocPointerDown );
  // add canvas to DOM
  this.anchor.parentNode.insertBefore( this.element, this.anchor.nextSibling );
  // measurements
  this.cursorBorder = parseInt( getComputedStyle( this.cursor ).borderWidth, 10 );
  this.canvasOffset = {
    x: this.canvas.offsetLeft,
    y: this.canvas.offsetTop,
  };

  this.isOpen = true;
};

proto.docPointerDown = function( event ) {
  if ( !this.element.contains( event.target ) && event.target != this.anchor ) {
    this.close();
  }
};

proto.close = function() {
  if ( !this.isOpen ) {
    return;
  }
  this.element.parentNode.removeChild( this.element );
  docElem.removeEventListener( 'mousedown', this.onDocPointerDown );
  docElem.removeEventListener( 'touchstart', this.onDocPointerDown );
  this.isOpen = false;
};

// ----- canvas pointer ----- //

proto.canvasPointerDown = function( event, pointer ) {
  event.preventDefault();
  var boundingRect = this.canvas.getBoundingClientRect();
  this.offset = {
    x: boundingRect.left + window.pageXOffset,
    y: boundingRect.top + window.pageYOffset,
  };
  this.canvasPointerChange( pointer );
};

proto.canvasPointerMove = function( event, pointer ) {
  this.canvasPointerChange( pointer );
};

proto.canvasPointerChange = function( pointer ) {
  var x = Math.round( pointer.pageX - this.offset.x );
  var y = Math.round( pointer.pageY - this.offset.y );
  var size = this.options.gridSize;
  var shades = this.options.shades;
  var shades1 = shades + 1;
  var sats = this.options.saturations;
  var maxYGrid = this.options.saturations * shades - 1;
  x = Math.max( 0, Math.min( x, size * 13 ) );
  y = Math.max( 0, Math.min( y, size * maxYGrid ) );
  var sx = Math.floor( x / size );
  var sy = Math.floor( y / size );
  var hue, sat, lum;
  if ( x < size * 12 ) {
    // colors
    hue = sx * 30;
    sat = 1 - Math.floor( sy / shades ) / sats;
    lum = 1 - ( sy % shades / shades1 + 1/shades1 );
  } else if ( x >= size * 13 & y < size * (shades+2) ) {
    // grays
    hue = 0;
    sat = 0;
    lum = 1 - sy/shades1;
  } else {
    return;
  }

  this.hue = hue;
  this.sat = sat;
  this.lum = lum;

  this.cursor.style.left = sx * size + this.canvasOffset.x -
    this.cursorBorder + 'px';
  this.cursor.style.top = sy * size + this.canvasOffset.y -
    this.cursorBorder + 'px';

  var moder = colorModers[ this.options.mode ] || colorModers.hsl;
  var color = moder( hue, sat, lum );
  this.updateColor( color );
};

proto.updateColor = function( color ) {
  if ( color == this.color ) {
    return;
  }
  // new color
  this.color = color;
  // set text
  if ( this.options.setText ) {
    var textProp = this.isInputAnchor ? 'value' : 'textContent';
    this.anchor[ textProp ] = color;
  }
  if ( this.options.setBGColor ) {
    this.anchor.style.backgroundColor = color;
    this.anchor.style.color = this.lum > 0.5 ? '#222' : 'white';
  }
  // event
  this.emitEvent( 'change', [ color ] );
};

// -------------------------- utils -------------------------- //

function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

function hsl2hex( h, s, l ) {
  var rgb = hsl2rgb( h, s, l );
  return rgb2hex( rgb );
}

// thx jfsiii
// https://github.com/jfsiii/chromath/blob/master/src/static.js#L312
function hsl2rgb(h, s, l) {

  var C = (1 - Math.abs(2*l-1)) * s;
  var hp = h/60;
  var X = C * (1-Math.abs(hp%2-1));
  var rgb, m;

  switch ( Math.floor(hp) ) {
    case 0:  rgb = [C,X,0]; break;
    case 1:  rgb = [X,C,0]; break;
    case 2:  rgb = [0,C,X]; break;
    case 3:  rgb = [0,X,C]; break;
    case 4:  rgb = [X,0,C]; break;
    case 5:  rgb = [C,0,X]; break;
    default: rgb = [0,0,0];
  }

  m = l - (C/2);
  rgb = rgb.map( function( v ) {
    return v + m;
  });

  return rgb;
}

function rgb2hex( rgb ) {
  var hex = rgb.map( function( value ) {
    value = Math.round( value * 255 );
    var hexNum = value.toString(16).toUpperCase();
    // left pad 0
    hexNum = hexNum.length < 2 ? '0' + hexNum : hexNum;
    return hexNum;
  });

  return '#' + hex.join('');
}

// #123456 -> #135
function roundHex( hex ) {
  return '#' + hex[1] + hex[3] + hex[5];
}
