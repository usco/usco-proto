var shape = new THREE.Mesh(new THREE.CubeGeometry(20,20,20),new THREE.MeshBasicMaterial({color:0xff0000}))
shape.name="shape"
assembly.add(shape);


//container
var fooObj = new THREE.Object3D();
fooObj.name = "fooObj"
var fooChild1 = new THREE.Mesh(new THREE.CubeGeometry(20,20,20),new THREE.MeshBasicMaterial({color:0x00ff00}));
var fooChild2 = new THREE.Mesh(new THREE.SphereGeometry(10,20,20),new THREE.MeshBasicMaterial({color:0x00ff00}));
fooChild2.position.z = 30;
fooObj.add(fooChild1);
fooObj.add(fooChild2);

fooObj.position.x =80;

assembly.add(fooObj);

var foo = new THREE.Object3D();
foo.name = "foo"
var bar = new THREE.Object3D();
bar.name = "bar"
foo.add(bar);

var barChild1 = new THREE.Mesh(new THREE.CubeGeometry(20,20,20),new THREE.MeshBasicMaterial({color:0x0000ff}));
bar.add(barChild1);
bar.position.y =40;

assembly.add(foo);
