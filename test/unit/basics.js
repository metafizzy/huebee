QUnit.test( 'basics', function( assert ) {

  var hueb = new Huebee( '.basics', {
    hues: 6,
    saturations: 2,
    setBGColor: true,
  });
  var elem = document.querySelector('.basics');

  assert.ok( hueb, 'new Huebee returns object' );
  assert.equal( hueb.options.hues, 6, 'option object sets option' );
  assert.equal( hueb.options.saturations, 2, 'option object sets option' );
  assert.equal( hueb.getColorCount(), 6 * 2 * 5 + 7, 'color count' );

  hueb.open();

  // fake select red
  hueb.once( 'change', function( color, hue, sat, lum ) {
    assert.ok( true, 'change event triggered');
    assert.equal( color, '#F00', 'change event #F00 red swatch selected' );
    assert.equal( hue, 0, 'change event hue' );
    assert.equal( sat, 1, 'change event sat' );
    assert.equal( lum, 0.5, 'change event lum' );
  });

  hueb.fakeSelect( 0, 2 );

  assert.equal( hueb.color, '#F00', '#F00 red swatch selected' );
  assert.equal( hueb.hue, 0, 'hue' );
  assert.equal( hueb.sat, 1, 'sat' );
  assert.equal( hueb.lum, 0.5, 'lum' );
  assert.equal( elem.textContent, '#F00', 'element text set' );
  assert.equal( elem.style.backgroundColor, 'rgb(255, 0, 0)', 'element background color set' );

  // fake select middle gray
  hueb.once( 'change', function( color, hue, sat, lum ) {
    assert.ok( true, 'change event triggered');
    assert.equal( color, '#888', 'change event #888 gray swatch selected' );
    assert.equal( sat, 0, 'change event sat' );
    assert.ok( Math.abs( lum - 0.5 ) <= 1/30 , 'change event lum' );
  });

  hueb.fakeSelect( 7, 3 );

  assert.equal( hueb.color, '#888', '#888 gray swatch selected' );
  assert.equal( hueb.sat, 0, 'sat' );
  assert.ok( Math.abs( hueb.lum - 0.5 ) <= 1/30 , 'lum' );
  assert.equal( elem.textContent, '#888', 'element text set' );
  assert.equal( elem.style.backgroundColor, 'rgb(136, 136, 136)', 'element background color set' );

  // setColor
  hueb.setColor('#c25');
  assert.equal( hueb.color, '#c25', 'setColor() sets color' );
  assert.equal( elem.textContent, '#c25', 'setColor() element text set' );
  hueb.setColor('foobar');
  assert.equal( hueb.color, '#c25', 'setColor() with invalid color does not set invalid color' );
  assert.equal( elem.textContent, '#c25', 'setColor() element text set' );

  hueb.close();

  assert.notOk( document.body.contains( hueb.element ), 'element removed after close' );

});
