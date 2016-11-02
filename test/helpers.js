Huebee.prototype.getColorCount = function() {
  var count = 0;
  for ( var position in this.swatches ) {
    count++;
  }
  return count;
};

Huebee.prototype.fakeSelect = function( gridX, gridY ) {
  this.updateOffset();
  this.canvasPointerChange({
    pageX: ( gridX+0.5 ) * this.gridSize + this.offset.x,
    pageY: ( gridY+0.5 ) * this.gridSize + this.offset.y,
  });
};
