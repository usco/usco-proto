Command = require('./command');

Translation = function ( value, target)
{
  Command.call( this );
  this.type = "translation";
  this.value = value;
  this.target = target;
}
Translation.prototype = Object.create( Command.prototype );
Translation.prototype.constructor=Translation;
Translation.prototype.clone = function()
{
  return new Translation( this.value.clone(), this.target);
}
/*Not sure about this
Translation.prototype.execute = function(value)
{
    this.target.position.add(value);
}*/

Translation.prototype.undo = function()
{
    this.target.position.sub(this.value);
}

Translation.prototype.redo = function()
{
    this.target.position.add(this.value);
}

module.exports = Translation;
