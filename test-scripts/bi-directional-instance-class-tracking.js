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

var foo = new Cube();
var bar = new Cube(50,10,20);
bar.position.y = 30;


assembly.add(foo)
assembly.add(bar)

