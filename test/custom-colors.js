const assert = require('assert');
const { test } = require('m.test');

module.exports = async function( page ) {

  const hueCount = 6;
  const satCount = 2;
  const shdCount = 3;

  let result = await page.evaluate( function( hues, saturations, shades ) {
    let $elem = document.querySelector('.custom-colors');
    let hueb = new Huebee( $elem, {
      hues,
      saturations,
      shades,
      customColors: [
        'pink', 'foobar', 'darkgray', '#19F',
        '#F80', 'red', 'orange',
        'lightblue',
      ],
    } );
    hueb.open();
    hueb.fakeSelect( 0, 0 );
    hueb.close();

    return {
      hueb,
      colorCount: hueb.getColorCount(),
      textContent: $elem.textContent,
    };
  }, hueCount, satCount, shdCount );

  test( 'customColors', function() {
    assert.equal( result.colorCount, hueCount * satCount * shdCount + 5 + 7,
        'valid custom colors added' );
    assert.ok( result.hueb.colorGrid.DARKGRAY, 'valid darkgray color added' );
    assert.ok( !result.hueb.colorGrid.FOOBAR, 'invalid foobar color not added' );
    assert.equal( result.hueb.color, 'pink', 'custom pink selected' );
    assert.equal( result.textContent, 'pink', 'custom pink text' );
  } );

};
