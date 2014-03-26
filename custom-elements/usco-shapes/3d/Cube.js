


function Cube(options)
{
  options = options || {};
  this.w = options.w || 20;
  this.h = options.h || 20;
  this.d = options.d || 20;

  Part.call( this );
  this.name = "Cube"+this.id;
  this.geometry = new THREE.CubeGeometry( this.w, this.d, this.h );
  //this._bsp = new ThreeBSP(this);
  
  this.properties["w"] = ["width", "Width of the cuboid", 20]//optional min max?
  this.properties["h"] = ["height", "height of the cuboid",20,0.0000001,100,0.1]
  this.properties["d"] = ["depth", "depth of the cuboid",20]
  //TODO: how to provide a preset list of acceptable values (to use with select etc)
  //TODO: add ability to provide range functions, select functions etc (generator functions for the previous
  //params
}
Cube.prototype = Object.create( Part.prototype );
Cube.prototype.constructor = Cube;

Cube.prototype.attributeChanged=function(attrName, oldValue, newValue)
{
  Part.prototype.attributeChanged.call(this, attrName, oldValue, newValue );
  
  console.log("cube's attribute changed", attrName, newValue, oldValue);
  this.geometry = new THREE.CubeGeometry( this.w, this.d, this.h );

  this.updateRenderables();
}

Cube.prototype.update=function( parameters )
{
  Part.prototype.update.call(this, parameters);
  //this.geometry.dispose();
  //delete this.__webglInit;
  //this.geometry = new THREE.CubeGeometry( this.w, this.d, this.h );
}

