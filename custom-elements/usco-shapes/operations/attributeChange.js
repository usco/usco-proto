Command = require('./command');

AttributeChange = function (target, attrName, oldValue, newValue)
{
  Command.call( this );
  this.type = "attributeChange";
  this.target = target;
  this.attrName = attrName;
  this.value = newValue;
  this.oldValue = oldValue;
  
  console.log("new attribute change operation", target, attrName, newValue, oldValue);
}
AttributeChange.prototype = Object.create( Command.prototype );
AttributeChange.prototype.constructor=AttributeChange;
AttributeChange.prototype.clone = function()
{
  return new AttributeChange( this.target, this.attrName, this.oldValue, this.value );
}

AttributeChange.prototype.undo = function()
{
  console.log("undo attrib change", this.value, this.oldValue, this.attrName);
  this.target.properties[this.attrName][2] = this.oldValue;//update( this.oldAttributes );
  this.target[this.attrName] = this.oldValue;
  
  //this.target.updateRenderables();
  //this.target.attributeChanged(this.attrName,this.oldValue, this.value ); 
}

AttributeChange.prototype.redo = function()
{
  this.target.properties[this.attrName][2] = this.value;//update( this.newAttributes );
  this.target[this.attrName] = this.value;
}

module.exports = AttributeChange;
