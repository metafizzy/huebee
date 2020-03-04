QUnit.test( 'resetColor', function( assert ) {

  var hueb = new Huebee( '.reset-color-input');
  var elem = document.querySelector('.reset-color-input');

  hueb.setColor('#F00');
  assert.equal( hueb.color, '#F00', 'setColor() sets color' );
  assert.equal( elem.style.backgroundColor, 'rgb(255, 0, 0)', 'element background color set' );
  assert.equal( hueb.cursor.classList.contains('is-hidden'), true, 'canvas cursor is hidden');
  hueb.resetColor();
  assert.equal( hueb.color, null, 'resetColor() resets color' );
  assert.equal( elem.style.backgroundColor, '', 'element background color resets' );
  assert.equal( hueb.cursor.classList.contains('is-hidden'), true, 'canvas cursor is hidden');

});


QUnit.test( 'resetColor staticOpen=true', function( assert ) {
  var hueb = new Huebee( '.reset-color--static-open-input', {
    staticOpen: true,
  });
  var elem = document.querySelector('.reset-color--static-open-input');

  hueb.setColor('#F00');
  assert.equal( hueb.color, '#F00', 'setColor() sets color' );
  assert.equal( elem.style.backgroundColor, 'rgb(255, 0, 0)', 'element background color set' );
  assert.equal( hueb.cursor.classList.contains('is-hidden'), false, 'canvas cursor is visible');
  hueb.resetColor();
  assert.equal( hueb.color, null, 'resetColor() resets color' );
  assert.equal( elem.style.backgroundColor, '', 'element background color resets' );
  assert.equal( hueb.cursor.classList.contains('is-hidden'), true, 'canvas cursor is hidden');
});
