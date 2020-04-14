const assert = require('assert');
const { test } = require('m.test');

module.exports = async function( page ) {

  let inited = await page.evaluate( function() {
    let hueb = new Huebee( '.basics', {
      hues: 6,
      saturations: 2,
      setBGColor: true,
    } );
    return {
      hueb,
      colorCount: hueb.getColorCount(),
    };
  } );

  test( 'initialize Huebee with options', function() {
    assert.ok( inited.hueb, 'new Huebee returns object' );
    assert.equal( inited.hueb.options.hues, 6, 'option object sets option' );
    assert.equal( inited.hueb.options.saturations, 2, 'option object sets option' );
    assert.equal( inited.colorCount, 6 * 2 * 5 + 7, 'color count' );
  } );

  // fake select red

  let redSelection = await page.evaluate( function() {
    let elem = document.querySelector('.basics');
    let hueb = Huebee.data( elem );
    hueb.open();
    let selection = { hueb };

    return new Promise( function( resolve ) {
      hueb.once( 'change', function( color, hue, sat, lum ) {
        selection.args = { color, hue, sat, lum };
        resolve( selection );
      } );
      hueb.fakeSelect( 0, 2 );
      selection.textContent = elem.textContent;
      selection.backgroundColor = elem.style.backgroundColor;
    } );
  } );

  test( 'select color on click, and trigger change event', function() {
    assert.equal( redSelection.args.color, '#F00',
        'change event #F00 red swatch selected' );
    assert.equal( redSelection.args.hue, 0, 'change event hue' );
    assert.equal( redSelection.args.sat, 1, 'change event sat' );
    assert.equal( redSelection.args.lum, 0.5, 'change event lum' );
    assert.equal( redSelection.hueb.color, '#F00', '#F00 red swatch selected' );
    assert.equal( redSelection.hueb.hue, 0, 'hue' );
    assert.equal( redSelection.hueb.sat, 1, 'sat' );
    assert.equal( redSelection.hueb.lum, 0.5, 'lum' );
    assert.equal( redSelection.textContent, '#F00', 'element text set' );
    assert.equal( redSelection.backgroundColor, 'rgb(255, 0, 0)',
        'element background color set' );
  } );

  // fake select middle gray

  let midGraySelection = await page.evaluate( function() {
    let elem = document.querySelector('.basics');
    let hueb = Huebee.data( elem );
    hueb.open();
    let selection = { hueb };

    return new Promise( function( resolve ) {
      hueb.once( 'change', function( color, hue, sat, lum ) {
        selection.args = { color, hue, sat, lum };
        resolve( selection );
      } );
      hueb.fakeSelect( 7, 3 );
      selection.textContent = elem.textContent;
      selection.backgroundColor = elem.style.backgroundColor;
    } );
  } );

  test( 'select color on click, and trigger change event', function() {
    assert.equal( midGraySelection.args.color, '#888',
        'change event #888 gray swatch selected' );
    assert.equal( midGraySelection.args.sat, 0, 'change event sat' );
    assert.ok( Math.abs( midGraySelection.args.lum - 0.5 ) <= 1/30,
        'change event lum' );
    assert.equal( midGraySelection.hueb.color, '#888', '#888 gray swatch selected' );
    assert.equal( midGraySelection.hueb.sat, 0, 'sat' );
    assert.ok( Math.abs( midGraySelection.hueb.lum - 0.5 ) <= 1/30, 'lum' );
    assert.equal( midGraySelection.textContent, '#888', 'element text set' );
    assert.equal( midGraySelection.backgroundColor, 'rgb(136, 136, 136)',
        'element background color set' );
  } );

  // setColor

  let c25ColorSet = await page.evaluate( function() {
    let elem = document.querySelector('.basics');
    let hueb = Huebee.data( elem );
    hueb.open();
    hueb.setColor('#c25');
    return {
      color: hueb.color,
      textContent: elem.textContent,
    };
  } );

  test( 'set color with .setColor()', function() {
    assert.equal( c25ColorSet.color, '#c25', 'setColor() sets color' );
    assert.equal( c25ColorSet.textContent, '#c25', 'setColor() element text set' );
  } );

  // setColor('invalid')

  let invalidColorSet = await page.evaluate( function() {
    let elem = document.querySelector('.basics');
    let hueb = Huebee.data( elem );
    hueb.open();
    hueb.setColor('invalid');
    return {
      color: hueb.color,
      textContent: elem.textContent,
    };
  } );

  test( 'no color test with .setColor(bad)', function() {
    assert.equal( invalidColorSet.color, '#c25',
        'setColor() with invalid color does not set invalid color' );
    assert.equal( invalidColorSet.textContent, '#c25', 'setColor() element text set' );
  } );

  // close()

  let bodyHasElem = await page.evaluate( function() {
    let hueb = Huebee.data('.basics');
    hueb.close();
    return document.body.contains( hueb.element );
  } );

  test( 'should remove element on .close()', function() {
    assert.ok( !bodyHasElem, 'element removed after close' );
  } );

};
