Huebee.prototype.getColorCount = function() {
  return Object.keys( this.swatches ).length;
};

Huebee.prototype.fakeSelect = function( gridX, gridY ) {
  this.updateOffset();
  this.canvasPointerChange({
    pageX: ( gridX + 0.5 ) * this.gridSize + this.offset.x,
    pageY: ( gridY + 0.5 ) * this.gridSize + this.offset.y,
  });
};
