Command = require('./command');

Deletion = function (target, parentObject)
{
  Command.call( this );
  this.type = "deletion";
  this.target = target;
  this.parentObject = parentObject;
}
Deletion.prototype = Object.create( Command.prototype );
Deletion.prototype.constructor=Deletion;
Deletion.prototype.clone = function()
{
  return new Creation( this.target, this.parentObject);
}

Deletion.prototype.undo = function()
{
    this.parentObject.add(this.target);
}

Deletion.prototype.redo = function()
{
  this.parentObject.remove(this.target);
}

module.exports = Deletion;
