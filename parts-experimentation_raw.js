/*would be hidden*/

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



//here is the actual test
function CustomPart()
{
  Part.call( this );
  
  var subCube = new Cube(17,2.4,3);
  this.add(subCube);

  var subCube2 = new Cube(3,14,3);
  subCube.position.y = 27;

  this.add(subCube2);
}
CustomPart.prototype = Object.create( Part.prototype );
CustomPart.prototype.constructor = CustomPart;


function OtherPart()
{
  //updating this SHOULD NOT require recompiling the customPart class above
  Part.call( this );
  
  var subSphere = new Sphere(17,2);
  this.add(subSphere);
}
OtherPart.prototype = Object.create( Part.prototype );
OtherPart.prototype.constructor = OtherPart;


//instanciate
var youpi = new CustomPart();
assembly.add(youpi);

var youpla = new OtherPart();
assembly.add(youpla);


//OTHER

//var farb = new Cube(2);
//assembly.add(farb);

//basics
cube = new THREE.Mesh( new THREE.CubeGeometry( 50, 50, 50 ), new THREE.MeshNormalMaterial() );
cube.position.x = 10;

assembly.add(cube);

