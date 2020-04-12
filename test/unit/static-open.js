QUnit.test( 'staticOpen', function( assert ) {
  var input = document.querySelector('.static-open-input');
  var hueb = new Huebee( input, {
    staticOpen: true,
    className: 'static-open-tester',
  } );

  assert.ok( document.body.contains( hueb.element ), 'huebee in document' );
  input.blur();
  assert.ok( hueb.isOpen, 'huebee still open after input blur' );
  hueb.close();
  assert.notOk( document.body.contains( hueb.element ), 'huebee removed after close()' );
  hueb.open();
  assert.ok( document.body.contains( hueb.element ),
      'huebee back in document after open()' );

} );
