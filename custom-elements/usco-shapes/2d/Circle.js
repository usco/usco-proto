Shape2d = require("./Shape2d");

function Circle(center, radius)
{
    this.radius = radius || 20;
    this.center = center || new THREE.Vector3();
    Shape2d.apply( this, arguments );
	  this.generate();
	  
    this.properties["radius"] = ["radius", "Radius of the circle", 20]
}
Circle.prototype = Object.create( Shape2d.prototype );
Circle.prototype.constructor = Circle;

Circle.prototype.generate = function()
{
  var center=this.center,radius=this.radius;
  var x = center.x, y = center.y;
  
  //TODO: move this to shape2D
  this.actions = [];
  this.curves = [];
  this.controlPoints = [];
  this.__visualContols = [];
  
	this.moveTo( radius+x, y );
  this.absarc( x, y, radius, 0, Math.PI*2, false );
}

Circle.prototype.attributeChanged=function( attrName, newValue, oldValue)
{
  console.log("Circle's attribute changed", attrName, newValue, oldValue);
  
  this[attrName] = newValue;
  this.properties[attrName][2] = newValue;
  
  this.generate();
  this.updateRenderables();
}

module.exports = Circle;
