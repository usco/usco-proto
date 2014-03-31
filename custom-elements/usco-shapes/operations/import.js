Command = require('./command');

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
  return new Import( this.value, this.target);
}
/*Not sure about this
Import.prototype.execute = function(value)
{
    this.target.position.add(value);
}*/

Import.prototype.undo = function()
{
  this._oldParent = this.value.parent;
  this.value.parent.remove(this.value);
  //hack
  this.value.renderable.visible = false;
}

Import.prototype.redo = function()
{
  this._oldParent.add(this.value);
  //hack
  this.value.renderable.visible = true;
}

module.exports = Import;
