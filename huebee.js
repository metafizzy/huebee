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
  mode: 'shortHex',
  setText: true,
  setBGColor: false,
};

var proto = Huebee.prototype = Object.create( EvEmitter.prototype );

proto.option = function( options ) {
  this.options = extend( this.options, options );
};

proto.create = function() {
  // properties
  this.setBGElems = this.getSetElems( this.options.setBGColor );
  this.setTextElems = this.getSetElems( this.options.setText );
  // events
  // HACK: this is getting ugly
  this.outsideCloseIt = this.outsideClose.bind( this );
  this.onDocKeydown = this.docKeydown.bind( this );
  this.closeIt = this.close.bind( this );
  this.openIt = this.open.bind( this );
  this.onElemTransitionend = this.elemTransitionend.bind( this );
  // open events
  this.isInputAnchor = this.anchor.nodeName == 'INPUT';
  this.anchor.addEventListener( 'click', this.openIt );
  this.anchor.addEventListener( 'focus', this.openIt );
  // change event
  if ( this.isInputAnchor ) {
    this.anchor.addEventListener( 'input', this.inputInput.bind( this ) );
  }
  // create element
  var element = this.element = document.createElement('div');
  element.className = 'huebee is-hidden ';
  element.className += this.options.className || '';
  // create container
  var container = this.container = document.createElement('div');
  container.className = 'huebee__container';
  // create canvas
  this.createCanvas();
  // create cursor
  this.cursor = document.createElement('div');
  this.cursor.className = 'huebee__cursor is-hidden';
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

proto.getSetElems = function( option ) {
  if ( option === true ) {
    return [ this.anchor ];
  } else if ( typeof option == 'string' ) {
    return document.querySelectorAll( option );
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
  // hash of color, h, s, l according to x,y grid position
  // [x,y] = { color, h, s, l }
  this.swatches = {};
  // hash of gridX,gridY position according to color
  // [#09F] = { x, y }
  this.colorGrid = {};
  this.updateColorModer();

  var shades = this.options.shades;
  var sats = this.options.saturations;
  var hues = this.options.hues;
  var customColors = this.options.customColors;

  // render custom colors
  if ( customColors && customColors.length ) {
    customColors.forEach( function( color, i ) {
      var x = i % hues;
      var y = Math.floor( i/hues );
      var swatch = getSwatch( color );
      if ( swatch ) {
        this.addSwatch( swatch, x, y );
      }
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
    var swatch = {
      color: this.colorModer( 0, 0, lum ),
      hue: 0,
      sat: 0,
      lum: lum,
    };
    this.addSwatch( swatch, hues+1, i );
  }
};

proto.renderColorGrid = function( i, sat, yOffset ) {
  var shades = this.options.shades;
  var hues = this.options.hues;
  var hue0 = this.options.hue0;
  for ( var row = 0; row < shades; row++ ) {
    for ( var col = 0; col < hues; col++ ) {
      var swatch = {
        hue: Math.round( col * 360/hues + hue0 ) % 360,
        sat: sat,
        lum: 1 - (row+1) / (shades+1),
      };
      swatch.color = this.colorModer( swatch.hue, sat, swatch.lum );
      var gridY = row + yOffset;
      this.addSwatch( swatch, col, gridY );
    }
  }
};

proto.addSwatch = function( swatch, gridX, gridY ) {
  var gridSize = this.gridSize;
  this.ctx.fillStyle = swatch.color;
  this.ctx.fillRect( gridX * gridSize, gridY * gridSize, gridSize, gridSize );
  // add swatch color to hash
  this.swatches[ gridX + ',' + gridY ] = swatch;
  // add color to colorGrid
  this.colorGrid[ swatch.color.toUpperCase() ] = {
    x: gridX,
    y: gridY,
  };
};

var colorModers = {
  hsl: function( h, s, l ) {
    s = Math.round( s * 100 );
    l = Math.round( l * 100 );
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
  },
  hex: hsl2hex,
  shortHex: function( h, s, l ) {
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
  /* jshint unused: false */
  if ( this.isOpen ) {
    return;
  }
  this.element.style.left = this.anchor.offsetLeft + 'px';
  this.element.style.top = this.anchor.offsetTop + this.anchor.offsetHeight +
    'px';
  this.bindOpenEvents( true );
  this.element.removeEventListener( 'transitionend', this.onElemTransitionend );
  // add canvas to DOM
  this.anchor.parentNode.insertBefore( this.element, this.anchor.nextSibling );
  // measurements
  var duration = getComputedStyle( this.element ).transitionDuration;
  this.hasTransition = duration && duration != 'none' && parseFloat( duration );
  this.cursorBorder = parseInt( getComputedStyle( this.cursor ).borderWidth, 10 );
  this.gridSize = Math.round( this.cursor.offsetWidth - this.cursorBorder * 2 );
  this.canvasOffset = {
    x: this.canvas.offsetLeft,
    y: this.canvas.offsetTop,
  };

  this.updateSizes();
  this.renderColors();

  if ( this.isInputAnchor ) {
    this.setColor( this.anchor.value );
  }

  this.isOpen = true;
  // trigger reflow for transition
  var h = this.element.offsetHeight;
  this.element.classList.remove('is-hidden');
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

var closeKeydowns = {
  13: true, // enter
  27: true, // esc
};

proto.docKeydown = function( event ) {
  if ( closeKeydowns[ event.keyCode ] ) {
    this.close();
  }
};

var supportsTransitions = typeof docElem.style.transform == 'string';

proto.close = function() {
  if ( !this.isOpen ) {
    return;
  }

  if ( supportsTransitions && this.hasTransition ) {
    this.element.addEventListener( 'transitionend', this.onElemTransitionend );
  } else {
    this.remove();
  }
  this.element.classList.add('is-hidden');

  this.bindOpenEvents( false );
  this.isOpen = false;
};

proto.remove = function() {
  var parent = this.element.parentNode;
  if ( parent.contains( this.element ) ) {
    parent.removeChild( this.element );
  }
};

proto.elemTransitionend = function( event ) {
  if ( event.target != this.element ) {
    return;
  }
  this.element.removeEventListener( 'transitionend', this.onElemTransitionend );
  this.remove();
};

proto.inputInput = function() {
  this.setColor( this.anchor.value );
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
  var sx = Math.floor( x/gridSize );
  var sy = Math.floor( y/gridSize );

  var swatch = this.swatches[ sx + ',' + sy ];
  this.setSwatch( swatch );
};

// ----- select ----- //

proto.setColor = function( color ) {
  var swatch = getSwatch( color );
  this.setSwatch( swatch );
};

proto.setSwatch = function( swatch ) {
  var color = swatch && swatch.color;
  if ( !swatch || color == this.color ) {
    return;
  }
  // color properties
  this.color = color;
  this.hue = swatch.hue;
  this.sat = swatch.sat;
  this.lum = swatch.lum;
  // estimate if color can have dark or white text
  var lightness = this.lum - Math.cos( (this.hue+60) / 180*Math.PI ) * 0.1;
  this.isLight = lightness > 0.5;
  // cursor
  var gridPosition = this.colorGrid[ color.toUpperCase() ];
  this.updateCursor( gridPosition );
  // set texts & backgrounds
  this.setTexts();
  this.setBackgrounds();
  // event
  this.emitEvent( 'change', [ color ] );
};

proto.setTexts = function() {
  if ( !this.setTextElems ) {
    return;
  }
  for ( var i=0; i < this.setTextElems.length; i++ ) {
    var elem = this.setTextElems[i];
    var property = elem.nodeName == 'INPUT' ? 'value' : 'textContent';
    elem[ property ] = this.color;
  }
};

proto.setBackgrounds = function() {
  if ( !this.setBGElems ) {
    return;
  }
  var textColor = this.isLight ? '#222' : 'white';
  for ( var i=0; i < this.setBGElems.length; i++ ) {
    var elem = this.setBGElems[i];
    elem.style.backgroundColor = this.color;
    elem.style.color = textColor;
  }
};

proto.updateCursor = function( position ) {
  // show cursor if color is on the grid
  var classMethod = position ? 'remove' : 'add';
  this.cursor.classList[ classMethod ]('is-hidden');

  if ( !position ) {
    return;
  }
  var gridSize = this.gridSize;
  var offset = this.canvasOffset;
  var border = this.cursorBorder;
  this.cursor.style.left = position.x*gridSize + offset.x - border + 'px';
  this.cursor.style.top = position.y*gridSize + offset.y - border + 'px';
};

// -------------------------- htmlInit -------------------------- //

var console = window.console;

function htmlInit() {
  var elems = document.querySelectorAll('[data-huebee]');
  for ( var i=0; i < elems.length; i++ ) {
    var elem = elems[i];
    var attr = elem.getAttribute('data-huebee');
    var options;
    try {
      options = attr && JSON.parse( attr );
    } catch ( error ) {
      // log error, do not initialize
      if ( console ) {
        console.error( 'Error parsing data-huebee on ' + elem.className +
          ': ' + error );
      }
      continue;
    }
    // initialize
    new Huebee( elem, options );
  }
}

var readyState = document.readyState;
if ( readyState == 'complete' || readyState == 'interactive' ) {
  htmlInit();
} else {
  document.addEventListener( 'DOMContentLoaded', htmlInit );
}

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

function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;

  var M = Math.max(r, g, b);
  var m = Math.min(r, g, b);
  var C = M - m;
  var L = 0.5*(M + m);
  var S = (C === 0) ? 0 : C/(1-Math.abs(2*L-1));

  var h;
  if (C === 0) h = 0; // spec'd as undefined, but usually set to 0
  else if (M === r) h = ((g-b)/C) % 6;
  else if (M === g) h = ((b-r)/C) + 2;
  else if (M === b) h = ((r-g)/C) + 4;

  var H = 60 * h;

  return [H, parseFloat(S), parseFloat(L)];
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
// grab first digit from hex
// not mathematically accurate, but makes for better palette
function roundHex( hex ) {
  return '#' + hex[1] + hex[3] + hex[5];
}

// proxy canvas used to check colors
var proxyCanvas = document.createElement('canvas');
proxyCanvas.width = 1;
proxyCanvas.height = 1;
var proxyCtx = proxyCanvas.getContext('2d');

function getSwatch( color ) {
  // check that color value is valid
  proxyCtx.clearRect( 0, 0, 1, 1 );
  proxyCtx.fillStyle = '#010203'; // reset value
  proxyCtx.fillStyle = color;
  proxyCtx.fillRect( 0, 0, 1, 1 );
  var imageData = proxyCtx.getImageData( 0, 0, 1, 1 ).data;
  if ( imageData.join(',') == '1,2,3,255' ) {
    // invalid color
    return;
  }
  // convert rgb to hsl
  var hsl = rgb2hsl.apply( this, imageData );
  return {
    color: color.trim(),
    hue: hsl[0],
    sat: hsl[1],
    lum: hsl[2],
  };
}
