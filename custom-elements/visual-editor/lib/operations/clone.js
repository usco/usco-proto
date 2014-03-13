Clone = function ( target, value )
{
  Command.call( this );
  this.type = "clone";
  this.target = target;
  this.value = value;
}
Clone.prototype = Object.create( Command.prototype );
Clone.prototype.constructor=Clone;
Clone.prototype.clone = function()
{
  return new Clone( this.target, this.value);
}

Clone.prototype.undo = function()
{
  this._oldParent = this.target.parent;
  this.target.parent.remove(this.target);
  
  //hack
  this.target.renderable.visible = false;
}

Clone.prototype.redo = function()
{
  this._oldParent.add(this.target);
  
  //hack
  this.target.renderable.visible = true;
}
