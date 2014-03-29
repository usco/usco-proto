//FIXME: HAAACK !
Subtraction2 = function ( leftOperand, rightOperands, result)
{
  Command.call( this );
  this.type = "subtraction";
  this.target = leftOperand;
  this.result = result ;
  //this.original = originalGeometry;
  this.operands = rightOperands || [];

  this._undoBackup = null;
  
}
Subtraction2.prototype = Object.create( Command.prototype );
Subtraction2.prototype.constructor=Subtraction2;
Subtraction2.prototype.clone = function()
{
  return new Subtraction2( this.target, this.original, this.operands);
}
  

Subtraction2.prototype.undo = function()
{
  var target = this.target;
  if(!(this._undoBackup)) this._undoBackup = target.geometry.clone();
  target.geometry = this.original.clone();//FIXME: seriously ? how many clones do we need ?
  
  target.updateRenderables();
}
Subtraction2.prototype.redo = function()
{
  var target = this.target;
  target.geometry = this._undoBackup.clone();//FIXME: seriously ? how many clones do we need ?
  
  target.updateRenderables();
}
