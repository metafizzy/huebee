const assert = require('assert');
const { test } = require('m.test');

module.exports = async function( page ) {

  let initialFocusHueb = await page.evaluate( function() {
    let $input1 = document.querySelector('.input1');
    let hueb1 = new Huebee( $input1 );
    $input1.focus();
    return hueb1;
  } );

  test( 'open on input focus', function() {
    assert.ok( initialFocusHueb.isOpen, 'Huebee opened on input focus' );
    assert.equal( initialFocusHueb.color, '#F90', 'initial input value sets color' );
  } );

  let input1Value = await page.evaluate( function() {
    let $input1 = document.querySelector('.input1');
    Huebee.data( $input1 ).setColor('#8C8');
    return $input1.value;
  } );

  test( 'setColor with input sets input value', function() {
    assert.equal( input1Value, '#8C8', 'setColor with input sets input value' );
  } );

  let hueb1IsOpen = await page.evaluate( function() {
    let $input2 = document.querySelector('.input2');
    $input2.focus();
    let isOpen = Huebee.data('.input1').isOpen;
    $input2.blur();
    return isOpen;
  } );

  test( 'huebee is closed if other input is focused', function() {
    assert.ok( !hueb1IsOpen );
  } );

  let hueb3 = await page.evaluate( function() {
    return new Huebee('.input3');
  } );

  test( '#08F input value, blue should be dark', function() {
    assert.ok( !hueb3.isLight, '#08F blue is dark' );
  } );

};
