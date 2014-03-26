
Shape2d = require("./Shape2d");

function Rectangle(width, height, center, radius)
{
    this.width = width || 40;
    this.height = height || 40;
    this.radius = radius || 5;
    this.center = center || new THREE.Vector3();
    
    Shape2d.apply( this, arguments );
    
    this.generate();
		
    this.properties["width"] = ["width", "Width of the rectangle", 40]
    this.properties["height"] = ["height", "height of the rectangle", 40,0.0000001,100,0.1]
    this.properties["radius"] = ["corner radius", "Radius of the rectangle's corners", 5]
	  
}
Rectangle.prototype = Object.create( Shape2d.prototype );
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.generate = function()
{
  var center=this.center,radius=this.radius,width=this.width, height=this.height;
  var x = center.x, y = center.y;
  
  //TODO: move this to shape2D
  this.actions = [];
  this.curves = [];
  this.controlPoints = [];
  this.__visualContols = [];
	  
  this.moveTo( x, y + radius );
	this.lineTo( x, y + height - radius );
	this.quadraticCurveTo( x, y + height, x + radius, y + height );
	this.lineTo( x + width - radius, y + height) ;
	this.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
	this.lineTo( x + width, y + radius );
	this.quadraticCurveTo( x + width, y, x + width - radius, y );
	this.lineTo( x + radius, y );
	this.quadraticCurveTo( x, y, x, y + radius );
}

Rectangle.prototype.attributeChanged=function( attrName, newValue, oldValue)
{
  console.log("Rectangle's attribute changed", attrName, newValue, oldValue);
  
  this[attrName] = newValue;
  this.properties[attrName][2] = newValue;
  
  this.generate();
  this.updateRenderables();
}

module.exports = Rectangle;

