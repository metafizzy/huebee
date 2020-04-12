QUnit.test( 'input', function( assert ) {

  var input1 = document.querySelector('.input1');
  var input2 = document.querySelector('.input2');
  var input3 = document.querySelector('.input3');

  var hueb1 = new Huebee( input1 );

  input1.focus();
  assert.ok( hueb1.isOpen, 'Huebee opened on input focus' );
  assert.equal( hueb1.color, '#F90', 'initial input value sets color' );

  hueb1.setColor('#8C8');
  assert.equal( input1.value, '#8C8', 'setColor with input sets input value' );

  input2.focus();
  assert.notOk( hueb1.isOpen, 'hueb1ee is closed if other input is focused' );

  input2.blur();

  // #08F input value, blue should be dark
  var hueb3 = new Huebee( input3 );
  assert.notOk( hueb3.isLight, '#08F blue is dark' );
  hueb3.setColor('#08F');
  assert.notOk( hueb3.isLight, '#08F blue is dark' );

} );
