QUnit.test( 'greyscale', function( assert ) {

  var elem = document.querySelector('.greyscale-enabled');
  var hueb = new Huebee( elem, {
    hues: 7,
    saturations: 1,
    shades: 7
  });
  var elemDisabled = document.querySelector('.greyscale-disabled');
  var huebDisabled = new Huebee( elemDisabled, {
    hues: 7,
    saturations: 1,
    shades: 7,
    greyscale: false
  });

  assert.equal( Object.keys(hueb.colorGrid).length, (7 * 7 + 7 + 2), ' greyscale enabled' );
  assert.equal( Object.keys(huebDisabled.colorGrid).length, (7 * 7), ' greyscale disabled' );

  hueb.open();
  huebDisabled.open();

  var canvasWidth = parseInt(hueb.canvas.style.width.replace('px', ''));
  var canvasDisabledWidth = parseInt(huebDisabled.canvas.style.width.replace('px', ''));
  var canvasH = hueb.canvas.height;
  var canvasDisabledH = huebDisabled.canvas.height;




  var shades = hueb.options.shades;
  var sats = hueb.options.saturations;
  var satY = hueb.satY;

  var height = Math.max( shades*sats + satY, shades+2 );

  var shadesDisabled = huebDisabled.options.shades;
  var satsDisabled = huebDisabled.options.saturations;
  var satYDisabled = huebDisabled.satY;

  var heightDisabled = Math.max( shadesDisabled*satsDisabled + satYDisabled, shadesDisabled);

  assert.equal( canvasWidth, hueb.gridSize * (hueb.options.hues + 2) , ' greyscale width ok' );
  assert.equal( canvasDisabledWidth, huebDisabled.gridSize * huebDisabled.options.hues, 'greyscale disabled width ok' );

  assert.equal( canvasH, hueb.gridSize * height * 2 , ' greyscale height ok' );
  assert.equal( canvasDisabledH, huebDisabled.gridSize * heightDisabled*2, ' greyscale disabled width ok' );



  assert.ok( hueb.colorGrid['#000'], ' black color added' );
  assert.notOk( huebDisabled.colorGrid['#000'], 'foobar color not added' );

  hueb.fakeSelect( 8, 0 );
  assert.equal( hueb.color, '#FFF', 'white selected' );

  huebDisabled.fakeSelect( 8, 0 );
  assert.equal( huebDisabled.color, undefined, 'undefined selection' );



  hueb.close();
  huebDisabled.close();

});
