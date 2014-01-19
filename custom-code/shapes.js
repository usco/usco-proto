function Part()
{
  THREE.Object3D.call(this);
  this._reflexed = null;
}
Part.prototype = Object.create( THREE.Object3D.prototype );
Part.prototype.constructor = Part;

function Foo()
{
  Part.call(this);
}
Foo.prototype = Object.create( Part.prototype );
Foo.prototype.constructor = Foo;

///////////////:
function Part()
{
  THREE.Mesh.call(this, undefined, new THREE.MeshNormalMaterial());

  this._reflexed = null;
}
Part.prototype = Object.create( THREE.Mesh.prototype );
Part.prototype.constructor = Part;

function Cube(w,h,d)
{
  this.w = w || 50;
  this.h = h || 50;
  this.d = d || 50;

  Part.call( this );
  this.geometry = new THREE.CubeGeometry( this.w, this.d, this.h );
}
Cube.prototype = Object.create( Part.prototype );
Cube.prototype.constructor = Cube;

function Sphere(r)
{
  this.r = r || 25;

  Part.call( this );
  this.geometry = new THREE.SphereGeometry( this.r, 30, 30 );
}
Sphere.prototype = Object.create( Part.prototype );
Sphere.prototype.constructor = Sphere;

var cube = new Cube();
cube.name="testCube";

var cube2 = new Cube();
cube2.name="testCube2";
cube2.position.x = -60;


var sphere = new Sphere();
sphere.name = "sphere"
sphere.position.y =50;

var sphere2 = new Sphere();
sphere2.name = "sphere2"
sphere2.position.x =-100;

assembly.add(cube);
assembly.add(cube2);
assembly.add(sphere);
assembly.add(sphere2);
