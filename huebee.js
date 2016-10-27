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
  hues: 12,
  hue0: 0,
  shades: 5,
  saturations: 3,
  mode: 'hsl',
  setText: true,
  setBGColor: false,
};

var proto = Huebee.prototype = Object.create( EvEmitter.prototype );

proto.option = function( options ) {
  this.options = extend( this.options, options );
};


proto.create = function() {
  // properties
  var setBGColor = this.options.setBGColor;
  if ( setBGColor === true ) {
    this.setBGElems = [ this.anchor ];
  } else if ( typeof setBGColor == 'string' ) {
    this.setBGElems = document.querySelectorAll( setBGColor );
  }
  // events
  // HACK: this is getting ugly
  this.outsideCloseIt = this.outsideClose.bind( this );
  this.onDocKeydown = this.docKeydown.bind( this );
  this.closeIt = this.close.bind( this );
  this.openIt = this.open.bind( this );
  // open events
  this.isInputAnchor = this.anchor.nodeName == 'INPUT';
  this.anchor.addEventListener( 'click', this.openIt );
  this.anchor.addEventListener( 'focus', this.openIt );
  // create element
  var element = this.element = document.createElement('div');
  element.className = 'huebee ';
  element.className += this.options.className || '';
  // create container
  var container = this.container = document.createElement('div');
  container.className = 'huebee__container';
  // create canvas
  this.createCanvas();
  // create cursor
  this.cursor = document.createElement('div');
  this.cursor.className = 'huebee__cursor';
  container.appendChild( this.cursor );
  // create close button
  this.createCloseButton();

  element.appendChild( container );
  // set relative position on parent
  var parentStyle = getComputedStyle( this.anchor.parentNode );
  if ( parentStyle.position != 'relative' && parentStyle.position != 'absolute' ) {
    this.anchor.parentNode.style.position = 'relative';
  }
};

proto.createCanvas = function() {
  var canvas = this.canvas = document.createElement('canvas');
  canvas.className = 'huebee__canvas';
  this.ctx = canvas.getContext('2d');
  // canvas pointer events
  var canvasPointer = this.canvasPointer = new Unipointer();
  canvasPointer._bindStartEvent( canvas );
  canvasPointer.on( 'pointerDown', this.canvasPointerDown.bind( this ) );
  canvasPointer.on( 'pointerMove', this.canvasPointerMove.bind( this ) );
  this.container.appendChild( canvas );
};

var svgURI = 'http://www.w3.org/2000/svg';

proto.createCloseButton = function() {
  var svg = document.createElementNS( svgURI, 'svg');
  svg.setAttribute( 'class', 'huebee__close-button' );
  svg.setAttribute( 'viewBox', '0 0 24 24' );
  var path = document.createElementNS( svgURI, 'path');
  path.setAttribute( 'd', 'M 7,7 L 17,17 M 17,7, L 7,17' );
  path.setAttribute( 'class', 'huebee__close-button__x' );
  svg.appendChild( path );
  svg.addEventListener( 'click', this.closeIt );
  this.container.appendChild( svg );
};

proto.renderColors = function() {
  // reset swatches
  this.swatches = {};
  this.updateColorModer();
  //
  var shades = this.options.shades;
  var sats = this.options.saturations;
  var hues = this.options.hues;
  var customColors = this.options.customColors;

  // render custom colors
  if ( customColors && customColors.length ) {
    customColors.forEach( function( color, i ) {
      var x = i % hues;
      var y = Math.floor( i/hues );
      this.addSwatch( color, x, y );
    }.bind( this ) );
  }

  // render saturation grids
  for ( var i=0; i < sats; i++ ) {
    var sat = 1 - i/sats;
    var yOffset = shades*i + this.satY;
    this.renderColorGrid( i, sat, yOffset );
  }

  // render grays
  for ( i=0; i < shades+2; i++ ) {
    var lum = 1 - i/(shades+1);
    var color = this.colorModer( 0, 0, lum );
    this.addSwatch( color, hues+1, i, 0, 0, lum );
  }
};

proto.renderColorGrid = function( i, sat, yOffset ) {
  var shades = this.options.shades;
  var hues = this.options.hues;
  var hue0 = this.options.hue0;
  for ( var row = 0; row < shades; row++ ) {
    for ( var col = 0; col < hues; col++ ) {
      var hue = Math.round( col * 360/hues + hue0 ) % 360;
      var lum = 1 - (row+1) / (shades+1);
      var gridY = row + yOffset;
      var color = this.colorModer( hue, sat, lum );
      this.addSwatch( color, col, gridY, hue, sat, lum );
    }
  }
};

proto.addSwatch = function( color, gridX, gridY, hue, sat, lum ) {
  var gridSize = this.gridSize;
  this.ctx.fillStyle = color;
  this.ctx.fillRect( gridX * gridSize, gridY * gridSize, gridSize, gridSize );
  // add swatch color to hash
  this.swatches[ gridX + ',' + gridY ] = {
    color: color,
    hue: hue,
    sat: sat,
    lum: lum,
  };
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

proto.updateColorModer = function() {
  this.colorModer = colorModers[ this.options.mode ] || colorModers.hsl;
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
  this.bindOpenEvents( true );
  // add canvas to DOM
  this.anchor.parentNode.insertBefore( this.element, this.anchor.nextSibling );
  // measurements
  this.cursorBorder = parseInt( getComputedStyle( this.cursor ).borderWidth, 10 );
  this.gridSize = Math.round( this.cursor.offsetWidth - this.cursorBorder * 2 );
  this.canvasOffset = {
    x: this.canvas.offsetLeft,
    y: this.canvas.offsetTop,
  };

  this.updateSizes();
  this.renderColors();

  this.isOpen = true;
};

proto.bindOpenEvents = function( isAdd ) {
  var method = ( isAdd ? 'add' : 'remove' ) + 'EventListener';
  docElem[ method]( 'mousedown', this.outsideCloseIt );
  docElem[ method]( 'touchstart', this.outsideCloseIt );
  document[ method ]( 'focusin', this.outsideCloseIt );
  document[ method ]( 'keydown', this.onDocKeydown );
  this.anchor[ method ]( 'blur', this.closeIt );
};

proto.updateSizes = function() {
  var hues = this.options.hues;
  var shades = this.options.shades;
  var sats = this.options.saturations;
  var customColors = this.options.customColors;
  var customLength = customColors && customColors.length;
  // y position where saturation grid starts
  this.satY = customLength ? Math.ceil( customLength/hues ) + 1 : 0;
  var height = Math.max( shades*sats + this.satY, shades+2 );
  this.canvas.width = this.gridSize * (hues+2);
  this.canvas.height = this.gridSize * height;
};

// close if target is not anchor or element
proto.outsideClose = function( event ) {
  var isAnchor = this.anchor.contains( event.target );
  var isElement = this.element.contains( event.target );
  if ( !isAnchor && !isElement ) {
    this.close();
  }
};

var onKeydowns = {
  13: function() { // enter
    this.close();
  },
  27: function() { // esc
    this.close();
  },
};

proto.docKeydown = function( event ) {
  // console.log( event.keyCode );
  var onKeydown = onKeydowns[ event.keyCode ];
  if ( onKeydown ) {
    onKeydown.call( this );
  }
};

proto.close = function() {
  if ( !this.isOpen ) {
    return;
  }
  this.element.parentNode.removeChild( this.element );
  this.bindOpenEvents( false );
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
  var gridSize = this.gridSize;
  var sx = Math.floor( x / gridSize );
  var sy = Math.floor( y / gridSize );

  var swatch = this.swatches[ sx + ',' + sy ];
  if ( !swatch ) {
    return;
  }

  this.hue = swatch.hue;
  this.sat = swatch.sat;
  this.lum = swatch.lum;
  // estimate if color can have dark or white text
  var lightness = this.lum - Math.cos( (this.hue+60) / 180*Math.PI ) * 0.1;
  this.isLight = lightness > 0.5;
  // position cursor
  this.cursor.style.left = sx * gridSize + this.canvasOffset.x -
    this.cursorBorder + 'px';
  this.cursor.style.top = sy * gridSize + this.canvasOffset.y -
    this.cursorBorder + 'px';

  this.updateColor( swatch.color );
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
  if ( this.setBGElems ) {
    var textColor = this.isLight ? '#222' : 'white';
    for ( var i=0; i < this.setBGElems.length; i++ ) {
      var elem = this.setBGElems[i];
      elem.style.backgroundColor = color;
      elem.style.color = textColor;
    }
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
