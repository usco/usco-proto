Command = require('./command');

//FIXME: HAAACK !
Intersection = function ( leftOperand, rightOperands, result )
{
  Command.call( this );
  this.type = "intersection";
  this.target = leftOperand;
  this.result = result ;
  this.operands = rightOperands || [];
}
Intersection.prototype = Object.create( Command.prototype );
Intersection.prototype.constructor=Intersection;
Intersection.prototype.clone = function()
{
  return new Intersection( this.target, this.operands, this.result );
}

Intersection.prototype.undo = function()
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

Intersection.prototype.redo = function()
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
  //target.dispatchEvent( { type: 'shapeChanged' } );
}

module.exports = Intersection;
