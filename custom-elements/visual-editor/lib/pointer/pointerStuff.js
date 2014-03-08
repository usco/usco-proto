//on-pointermove="{{ptrMove}}"

//TODO: implement snap to faces/normals
//TODO: implement snap to connectors
//TODO: implement display dimentions/offset

function PointerHelper
{

}

 //pointer movement and tracking of object normals
    ptrMove:function(event)
    {
      return;
      var event = event.impl || event;
        event = normalizeEvent(event);
        var x = event.offsetX;
        var y = event.offsetY;

      this.projector = new THREE.Projector();
    	var	v = new THREE.Vector3((x / this.viewer.width) * 2 - 1, -(y / this.viewer.height) * 2 + 1, 1);
      this.projector.unprojectVector(v, this.viewer.camera);
		  var raycaster = new THREE.Raycaster(this.viewer.camera.position, v.sub(this.viewer.camera.position).normalize());
     
		  var intersects = raycaster.intersectObjects(this.viewer.hierarchyRoot.children, true);
      if (intersects.length > 0) {
        var inter = intersects[0];
        if(!(inter.face)) return;
        var face = inter.face;
        var normal = inter.face.normal;
        var object = inter.object;

        var normalMatrix = new THREE.Matrix3().getNormalMatrix( object.matrixWorld );
        var worldNormal = normal.clone().applyMatrix3( normalMatrix ).normalize().multiplyScalar(50);

        var geometry = new THREE.Geometry();
        var start = inter.point.clone();
        var end   = inter.point.clone().add( worldNormal );

        delete this.fakeCursor.__webglInit;
        geometry.vertices.push( start );
        geometry.vertices.push( end );
        this.fakeCursor.geometry.dispose();
        this.fakeCursor.geometry = geometry;

        /*var tmp = new THREE.Mesh(new THREE.CubeGeometry(3,3,3), new THREE.MeshBasicMaterial({color:0xFF0000}));
        tmp.position = inter.point.clone();
        this.viewer.addToScene( tmp );*/
      }
      
    },
