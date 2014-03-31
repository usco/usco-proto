Command = require('./command');

//FIXME: HAAACK !
Subtraction2 = function ( leftOperand, rightOperands, result)
{
  Command.call( this );
  this.type = "subtraction";
  this.target = leftOperand;
  this.result = result ;
  this.operands = rightOperands || [];

  this._undoBackup = null;
  
}
Subtraction2.prototype = Object.create( Command.prototype );
Subtraction2.prototype.constructor=Subtraction2;
Subtraction2.prototype.clone = function()
{
  return new Subtraction2( this.target, this.operands, this.result );
}
  

Subtraction2.prototype.undo = function()
{
  /*var target = this.target;
  if(!(this._undoBackup)) this._undoBackup = target.geometry.clone();
  target.geometry = this.original.clone();//FIXME: seriously ? how many clones do we need ?*/
  
  //target.updateRenderables();
  //remove resulting shape from view
  var resRenderable = this.result.renderable;
  var resRenderableParent = resRenderable.parent;
  resRenderableParent.remove( resRenderable ) ;
  
  //re-add operands to view
  var leftOpRenderable = this.target.renderable;
  resRenderableParent.add( leftOpRenderable );
  
  var operands = this.operands;
  for(var i = 0; i < operands.length;i++)
  {
      var op = operands[i].renderable;
      resRenderableParent.add( op );
  }
  
}
Subtraction2.prototype.redo = function()
{
  /*var target = this.target;
  target.geometry = this._undoBackup.clone();//FIXME: seriously ? how many clones do we need ?
  
  target.updateRenderables();*/
  var leftOpRenderable = this.target.renderable;
  var leftOpRenderableParent = leftOpRenderable.parent;
  leftOpRenderableParent.remove( leftOpRenderable);
  
  leftOpRenderableParent.add(this.result.renderable);
  
  var operands = this.operands;
  for(var i = 0; i < operands.length;i++)
  {
      var op = operands[i].renderable;
      op.parent.remove( op );
  }
}

module.exports = Subtraction2;
