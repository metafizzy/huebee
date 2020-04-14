const assert = require('assert');
const { test } = require('m.test');

module.exports = async function( page ) {
  let result = await page.evaluate( function() {
    let $input = document.querySelector('.static-open-input');
    let hueb = new Huebee( $input, {
      staticOpen: true,
      className: 'static-open-tester',
    } );

    let results = {};

    results.bodyContainsAfterInit = document.body.contains( hueb.element );

    $input.blur();
    results.huebIsOpenAfterBlur = hueb.isOpen;

    hueb.close();
    results.bodyContainsAfterClose = document.body.contains( hueb.element );

    hueb.open();
    results.bodyContainsAfterOpen = document.body.contains( hueb.element );

    return results;
  } );

  test( 'staticOpen', function() {
    assert.ok( result.bodyContainsAfterInit, 'huebee in document on init' );
    assert.ok( result.huebIsOpenAfterBlur, 'huebee still open after input blur' );
    assert.ok( !result.bodyContainsAfterClose, 'huebee removed after close()' );
    assert.ok( result.bodyContainsAfterOpen, 'huebee back in document after open()' );
  } );

};
