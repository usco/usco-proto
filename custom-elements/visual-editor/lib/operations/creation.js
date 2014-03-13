Creation = function (target, parentObject, options)
{
  Command.call( this );
  this.type = "creation";
  this.target = target;
  this.parentObject = parentObject;
  this.value = options;
}
Creation.prototype = Object.create( Command.prototype );
Creation.prototype.constructor=Creation;
Creation.prototype.clone = function()
{
  return new Creation( this.target, this.parentObject, this.value);
}

Creation.prototype.undo = function()
{
  this._oldParent = this.target.parent;
  this.target.parent.remove(this.target);
  
  //hack
  this.target.renderable.visible = false;
}

Creation.prototype.redo = function()
{
  this._oldParent.add(this.target);
  
  //hack
  this.target.renderable.visible = true;
}
