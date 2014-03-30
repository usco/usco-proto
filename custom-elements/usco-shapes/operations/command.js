//operation "class"
Command = function ( type, value, target)
{
  this.type = type;
  this.value = value;
  this.target = target;
}
Command.prototype.clone = function()
{
  throw new Error("not implemented");
}

module.exports = Command;
