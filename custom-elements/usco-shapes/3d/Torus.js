

function Torus(options)
{
  options = options || {};
  this.r = options.r || 10;
  this.tube = options.tube || 4;
  this.$fn = options.$fn || 20;

  Part.call( this );
  //var geometry = new THREE.TorusKnotGeometry( 20, 6, 200, 100, 1, 3 );
  this.geometry = new THREE.TorusGeometry( this.r,this.tube, this.$fn, this.$fn );
  //radius, tube, segmentsR, segmentsT, arc
  
  this.properties["r"] = ["radius", "Radius of torus", 10]
  this.properties["tube"] =["tube","bla", 4]
  this.properties["$fn"] = ["resolution", "resolution of the torus (polygonal)",20]
}
Torus.prototype = Object.create( Part.prototype );
Torus.prototype.constructor = Torus;

Torus.prototype.attributeChanged=function(attrName, oldValue, newValue)
{
  Part.prototype.attributeChanged.call(this, attrName, oldValue, newValue );  
  console.log("Torus's attribute changed", attrName, newValue, oldValue, this, this.properties);
  this.geometry = new THREE.TorusGeometry( this.r,this.tube, this.$fn, this.$fn );

  this.updateRenderables();
}
              
