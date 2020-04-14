const assert = require('assert');
const { test } = require('m.test');

module.exports = async function( page ) {
  let result = await page.evaluate( function() {
    let $elem = document.querySelector('.css');
    let hueb = new Huebee( $elem, {
      hues: 6,
      saturations: 1,
      className: 'huebee--css',
    } );
    hueb.open();
    let size0 = hueb.gridSize;
    hueb.close();

    hueb.element.classList.add('is-big');
    hueb.open();
    let size1 = hueb.gridSize;
    hueb.close();

    return {
      size0,
      size1,
    };
  } );

  test( 'grid size set with CSS', function() {
    assert.equal( result.size0, 20, 'initial grid size set with CSS' );
    assert.equal( result.size1, 30, 'grid size changed with CSS' );
  } );

};
