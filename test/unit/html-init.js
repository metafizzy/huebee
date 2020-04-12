QUnit.test( 'html start', function( assert ) {

  var input = document.querySelector('.html-init-input');
  var hueb = Huebee.data( input );

  assert.ok( hueb, 'huebee instance there on html init' );
  assert.equal( hueb.options.saturations, 2, 'saturations option set' );
  assert.equal( hueb.options.shades, 3, 'shades option set' );
  assert.equal( hueb.options.setBGColor, true, 'setBGColor option set' );

  input.focus();
  assert.ok( document.body.contains( hueb.element ),
      'focus opens, huebee element present' );
  // select yellow
  hueb.fakeSelect( 2, 1 );
  assert.equal( hueb.color, '#FF0', '#FF0 fake selected' );
  assert.equal( input.style.backgroundColor, 'rgb(255, 255, 0)', '#FF0 bg set' );

  input.blur();

} );
