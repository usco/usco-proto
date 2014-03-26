Part = require("./Shape3d");

function Sphere(options)
{
  options = options || {};
  this.r = options.r || 10;
  this.$fn = options.$fn || shapeDefaultMaxResolution;

  Part.call( this );
  this.geometry = new THREE.SphereGeometry( this.r, this.$fn, this.$fn );
  
  this.properties["r"] = ["radius", "Radius of the sphere", 10]//optional min max?
  this.properties["$fn"] = ["resolution", "resolution of the sphere",shapeDefaultMaxResolution]
}
Sphere.prototype = Object.create( Part.prototype );
Sphere.prototype.constructor = Sphere;


Sphere.prototype.attributeChanged=function(attrName, oldValue, newValue)
{
  Part.prototype.attributeChanged.call(this, attrName, oldValue, newValue );

  console.log("sphere's attribute changed", attrName, newValue, oldValue);
  this.geometry = new THREE.SphereGeometry( this.r, this.$fn, this.$fn );
  
  this.updateRenderables();
}

module.exports = Sphere;
