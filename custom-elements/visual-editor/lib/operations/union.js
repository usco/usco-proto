//FIXME: HAAACK !
Union = function ( target, originalGeometry, operands)
{
  Command.call( this );
  this.type = "union";
  this.target = target;
  this.original = originalGeometry;
  this.operands = operands || [];

  this._undoBackup = null;
}
Union.prototype = Object.create( Command.prototype );
Union.prototype.constructor=Union;
Union.prototype.clone = function()
{
  return new Union( this.target, this.original, this.operands);
}

Union.prototype.undo = function()
{
  var target = this.target;
  this._undoBackup = target.geometry;
  var pos = target.position.clone();

  delete target.__webglInit;
  target.geometry = this.original;
  target.dispatchEvent( { type: 'shapeChanged' } );
}
Union.prototype.redo = function()
{
  var target = this.target;
  delete target.__webglInit;
  target.geometry = this._undoBackup;
  target.dispatchEvent( { type: 'shapeChanged' } );
}
