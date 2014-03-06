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
    this.parentObject.remove(this.target);
}

Creation.prototype.redo = function()
{
  this.parentObject.add(this.target);
}
