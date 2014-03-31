Command = require('./command');

//FIXME: HAAACK !, should perhaps be closer to esprima node
/*target : result

*/
Union = function ( leftOperand, rightOperands, result )
{
  Command.call( this );
  this.type = "union";
  this.target = leftOperand;
  this.result = result ;
  this.operands = rightOperands || [];
}
Union.prototype = Object.create( Command.prototype );
Union.prototype.constructor=Union;
Union.prototype.clone = function()
{
  return new Union( this.target, this.operands, this.result );
}

Union.prototype.undo = function()
{
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
Union.prototype.redo = function()
{
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

module.exports = Union;
