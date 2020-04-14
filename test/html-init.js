const assert = require('assert');
const { test } = require('m.test');

module.exports = async function( page ) {
  let result = await page.evaluate( function() {
    let $input = document.querySelector('.html-init-input');
    let hueb = Huebee.data( $input );
    let results = {
      hueb,
      initialOptions: { ...hueb.options },
    };

    $input.focus();
    results.bodyContainsOnFocus = document.body.contains( hueb.element );
    // select yellow
    hueb.fakeSelect( 2, 1 );
    results.backgroundColor = $input.style.backgroundColor;
    $input.blur();

    return results;
  } );

  test( 'HTML init', function() {
    assert.ok( result.hueb, 'HTML initialized' );
    assert.equal( result.initialOptions.saturations, 2, 'saturations option set' );
    assert.equal( result.initialOptions.shades, 3, 'shades option set' );
    assert.equal( result.initialOptions.setBGColor, true, 'setBGColor option set' );
    assert.ok( result.bodyContainsOnFocus, 'focus opens, huebee element present' );
    assert.equal( result.hueb.color, '#FF0', '#FF0 fake selected' );
    assert.equal( result.backgroundColor, 'rgb(255, 255, 0)', '#FF0 bg set' );
  } );

};
