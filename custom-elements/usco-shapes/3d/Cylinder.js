
function Cylinder(options)
{
  options = options || {};
  this.r = options.r || 10;
  this.r2 = options.r2 || 10;
  this.h = options.h || 10;
  this.$fn = options.$fn || shapeDefaultMaxResolution;

  Part.call( this );
  this.geometry = new THREE.CylinderGeometry( this.r2, this.r, this.h ,this.$fn );
  this.geometry.applyMatrix(new THREE.Matrix4().makeRotationX( Math.PI / 2 ));
  
  this.properties["r"] = ["bottom radius", "Radius of the bottom of cylinder", 10]
  this.properties["r2"] =["top radius", "Radius of the top of the cylinder", 10]//optional min max?
  this.properties["h"] =["height", "Height of the cylinder", 10]//optional min max?
  this.properties["$fn"] = ["resolution", "resolution of the cylinder (polygonal)",shapeDefaultMaxResolution]
}
Cylinder.prototype = Object.create( Part.prototype );
Cylinder.prototype.constructor = Cylinder;

Cylinder.prototype.attributeChanged=function(attrName, oldValue, newValue)
{
  Part.prototype.attributeChanged.call(this, attrName, oldValue, newValue );
  
  this.geometry = new THREE.CylinderGeometry( this.r2, this.r, this.h ,this.$fn);
  this.geometry.applyMatrix(new THREE.Matrix4().makeRotationX( Math.PI / 2 ));
  console.log("Cylinder's attribute changed", attrName, newValue, oldValue, this, this.properties, this.geometry);  
  
  this.updateRenderables();
}

