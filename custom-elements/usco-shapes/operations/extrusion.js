Command = require('./command');

Extrusion = function (target, value, sourceShape, parentObject)
{
  Command.call( this );
  this.type = "extrusion";
  this.target = target;
  this.value = value;
  this.sourceShape = sourceShape;
  this.parentObject = parentObject;
}
Extrusion.prototype = Object.create( Command.prototype );
Extrusion.prototype.constructor=Extrusion;
Extrusion.prototype.clone = function()
{
  return new Extrusion( this.target, this.value, this.sourceShape, this.parentObject);
}

Extrusion.prototype.undo = function()
{
    this.parentObject.remove(this.target);
}

Extrusion.prototype.redo = function()
{
  this.parentObject.add(this.target);
}

module.exports = Extrusion;
