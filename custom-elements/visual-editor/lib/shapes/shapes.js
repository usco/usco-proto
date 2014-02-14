function Part()
{
  THREE.Mesh.call(this, undefined, new THREE.MeshNormalMaterial());

  this._reflexed = null;
}
Part.prototype = Object.create( THREE.Mesh.prototype );
Part.prototype.constructor = Part;

function Cube(w,h,d)
{
  this.w = w || 20;
  this.h = h || 20;
  this.d = d || 20;

  Part.call( this );
  this.geometry = new THREE.CubeGeometry( this.w, this.d, this.h );
}
Cube.prototype = Object.create( Part.prototype );
Cube.prototype.constructor = Cube;

function Sphere(r)
{
  this.r = r || 10;

  Part.call( this );
  this.geometry = new THREE.SphereGeometry( this.r, 30, 30 );
}
Sphere.prototype = Object.create( Part.prototype );
Sphere.prototype.constructor = Sphere;



