QUnit.test( 'css', function( assert ) {
  var elem = document.querySelector('.css');
  var hueb = new Huebee( elem, {
    hues: 6,
    saturations: 1,
    className: 'css-huebee',
  });
  hueb.open();
  assert.equal( hueb.gridSize, 20, 'grid size set with CSS');
  hueb.close();

  hueb.element.classList.add('is-big');
  hueb.open();
  assert.equal( hueb.gridSize, 30, 'grid size changed with CSS');
  hueb.close();
});
