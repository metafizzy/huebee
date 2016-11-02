QUnit.test( 'input', function( assert ) {

  var input1 = document.querySelector('.input1');
  var input2 = document.querySelector('.input2');

  var hueb = new Huebee( input1 );

  input1.focus();
  assert.ok( hueb.isOpen, 'huebee opened on input focus' );
  assert.equal( hueb.color, '#F90', 'initial input value sets color' );

  hueb.setColor('#8C8');
  assert.equal( input1.value, '#8C8', 'setColor with input sets input value' );

  input2.focus();
  assert.notOk( hueb.isOpen, 'huebee is closed if other input is focused' );

});
