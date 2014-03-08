AttributeChange = function (target, oldAttributes, newAttributes)
{
  Command.call( this );
  this.type = "attributeChange";
  this.target = target;
  this.value = oldAttributes;
  this.newAttributes = newAttributes;
}
AttributeChange.prototype = Object.create( Command.prototype );
AttributeChange.prototype.constructor=AttributeChange;
AttributeChange.prototype.clone = function()
{
  return new AttributeChange( this.target, this.value);
}

AttributeChange.prototype.undo = function()
{
  this.target.update( this.oldAttributes );
}

AttributeChange.prototype.redo = function()
{
  this.target.update( this.newAttributes );
}
