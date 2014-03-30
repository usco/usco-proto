Command = require('./command');

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
  
  //semi hack
  if(this.target.renderable)
  {
    this.target.renderable._oldParent = this.target.renderable.parent;
    this.target.renderable.parent.remove(this.target.renderable);
  }
}

Creation.prototype.redo = function()
{
  this._oldParent.add(this.target);
  
  //semi-hack
  if(this.target.renderable)
  {
    this.target.renderable._oldParent.add( this.target.renderable );
  }
}

module.exports = Creation;
