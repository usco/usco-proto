Command = require('./command');

Mirror = function ( target, axis)
{
  Command.call( this );
  this.type = "mirroring";
  this.target = target;
  this.value = axis
}
Mirror.prototype = Object.create( Command.prototype );
Mirror.prototype.constructor=Translation;
Mirror.prototype.clone = function()
{
  return new Mirror( this.target, this.value);
}

Mirror.prototype.undo = function()
{
    this.target.mirror(this.value);
}

Mirror.prototype.redo = function()
{
    this.target.mirror(this.value);
}

module.exports = Mirror;
