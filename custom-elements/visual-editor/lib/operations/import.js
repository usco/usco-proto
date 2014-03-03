Import = function ( value, target)
{
  Command.call( this );
  this.type = "import";
  this.value = value;
  this.target = target;
}
Import.prototype = Object.create( Command.prototype );
Import.prototype.constructor=Import;
Import.prototype.clone = function()
{
  return new Import( this.value.clone(), this.target);
}
/*Not sure about this
Import.prototype.execute = function(value)
{
    this.target.position.add(value);
}*/

Import.prototype.undo = function()
{
}

Import.prototype.redo = function()
{
}
