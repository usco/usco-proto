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
  if(!(this._undoBackup)) this._undoBackup = target.geometry.clone();
  target.geometry = this.original.clone();//FIXME: seriously ? how many clones do we need ?
  
  target.updateRenderables();
}
Subtraction.prototype.redo = function()
{
  var target = this.target;
  target.geometry = this._undoBackup.clone();//FIXME: seriously ? how many clones do we need ?
  
  target.updateRenderables();
}
