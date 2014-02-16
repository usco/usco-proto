//FIXME: HAAACK !
Subtraction = function ( target, originalGeometry, operands)
{
  Command.call( this );
  this.type = "subtraction";
  this.target = target;
  this.original = originalGeometry;
  this.operands = operands || [];

  this._undoBackup = null;
  
}
Subtraction.prototype = Object.create( Command.prototype );
Subtraction.prototype.constructor=Subtraction;
Subtraction.prototype.clone = function()
{
  return new Subtraction( this.target, this.original, this.operands);
}
  

Subtraction.prototype.undo = function()
{
  var target = this.target;
  this._undoBackup = target.geometry;
  var pos = target.position.clone();

  delete target.__webglInit;
  target.geometry = this.original;
  target.dispatchEvent( { type: 'shapeChanged' } );
}
Subtraction.prototype.redo = function()
{
  var target = this.target;
  delete target.__webglInit;
  target.geometry = this._undoBackup;
  target.dispatchEvent( { type: 'shapeChanged' } );
}
