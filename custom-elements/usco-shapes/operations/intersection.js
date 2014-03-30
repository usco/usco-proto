Command = require('./command');

//FIXME: HAAACK !
Intersection = function ( target, originalGeometry, operands)
{
  Command.call( this );
  this.type = "intersection";
  this.target = target;
  this.original = originalGeometry;
  this.operands = operands || [];

  this._undoBackup = null;
}
Intersection.prototype = Object.create( Command.prototype );
Intersection.prototype.constructor=Intersection;
Intersection.prototype.clone = function()
{
  return new Intersection( this.target, this.original, this.operands);
}


Intersection.prototype.undo = function()
{
  var target = this.target;
  this._undoBackup = target.geometry;
  var pos = target.position.clone();

  delete target.__webglInit;
  target.geometry = this.original;
  target.dispatchEvent( { type: 'shapeChanged' } );
}
Intersection.prototype.redo = function()
{
  var target = this.target;
  delete target.__webglInit;
  target.geometry = this._undoBackup;
  target.dispatchEvent( { type: 'shapeChanged' } );
}

module.exports = Intersection;
