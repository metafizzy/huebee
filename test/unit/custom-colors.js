QUnit.test( 'custom colors', function( assert ) {

  var elem = document.querySelector('.custom-colors');
  var hueb = new Huebee( elem, {
    hues: 6,
    saturations: 2,
    shades: 3,
    customColors: [
      'pink', 'foobar', 'darkgray', '#19F',
      '#F80', 'red', 'orange',
      'lightblue'
    ],
  });

  assert.equal( hueb.getColorCount(), 6 * 2 * 3 + 5 + 7, 'custom colors added' );
  assert.ok( hueb.colorGrid.DARKGRAY, 'darkgray color added' );
  assert.notOk( hueb.colorGrid.FOOBAR, 'foobar color not added' );

  hueb.open();
  hueb.fakeSelect( 0, 0 );
  assert.equal( hueb.color, 'pink', 'custom pink selected' );
  assert.equal( elem.textContent, 'pink', 'custom pink text' );

  hueb.close();

});
