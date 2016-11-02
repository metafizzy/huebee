QUnit.test( 'set multiples', function( assert ) {

  var hueb = new Huebee( '.set-multiples', {
    setText: '.set-multiples-elem',
    setBGColor: '.set-multiples-elem',
  });
  var items = document.querySelectorAll('.set-multiples-list li');

  hueb.setColor('#19F');

  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    assert.equal( item.textContent, '#19F', 'setText on multiple ' + i );
    assert.equal( item.style.backgroundColor, 'rgb(17, 153, 255)', 'setBGColor on multiple ' + i );
  }

});