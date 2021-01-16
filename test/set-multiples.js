const assert = require('assert');
const { test } = require('m.test');

module.exports = async function( page ) {

  let result = await page.evaluate( function() {
    let hueb = new Huebee( '.set-multiples', {
      setText: '.set-multiples-elem',
      setBGColor: '.set-multiples-elem',
    } );

    hueb.setColor('#19F');
    let items = [ ...document.querySelectorAll('.set-multiples-list li') ];

    return {
      length: items.length,
      textContents: items.map( ( item ) => item.textContent ),
      backgroundColors: items.map( ( item ) => item.style.backgroundColor ),
    };
  } );

  test( 'setText and setBGColor work on multiple elements', function() {
    assert.ok( result.length > 2 );
    result.textContents.forEach( function( textContent ) {
      assert.equal( textContent, '#19F' );
    } );
    result.backgroundColors.forEach( function( backgroundColor ) {
      assert.equal( backgroundColor, 'rgb(17, 153, 255)' );
    } );
  } );

};
