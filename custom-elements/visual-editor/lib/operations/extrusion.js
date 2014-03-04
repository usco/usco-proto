Extrusion = function (target, parentObject)
{
  Command.call( this );
  this.type = "extrusion";
  this.target = target;
  this.parentObject = parentObject;
}
Extrusion.prototype = Object.create( Command.prototype );
Extrusion.prototype.constructor=Extrusion;
Extrusion.prototype.clone = function()
{
  return new Extrusion( this.target, this.parentObject);
}

Extrusion.prototype.undo = function()
{
    this.parentObject.remove(this.target);
}

Extrusion.prototype.redo = function()
{
  this.parentObject.add(this.target);
}
