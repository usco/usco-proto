

function Connector()
{
    THREE.Object3D.call( this );

    //this.visualHelper =  new THREE.Mesh( new THREE.CylinderGeometry( 10, 10, 20 ), new MeshBasicMaterial({color:0xff0000} );
    var color = 0xFF0000;
    var to = this.up.clone().multiplyScalar(20);

    var lineGeometry = new THREE.Geometry();
    var vertArray = lineGeometry.vertices;
    vertArray.push( new THREE.Vector3(),to) ;
    lineGeometry.computeLineDistances();

    var lineMaterial = new THREE.LineDashedMaterial( { color: color, dashSize: 4, gapSize: 2 } );
    var line = new THREE.Line( lineGeometry, lineMaterial );
    line.name = "connectorArrowHelper";

    var arrowHead = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.5, 3, 5, 5, false), new THREE.MeshBasicMaterial({color:color}));
    arrowHead.position = to;
    arrowHead.lookAt( to.clone().multiplyScalar(10) );
    arrowHead.rotateX(Math.PI/2);
    line.add( arrowHead );

    this.add( line );//this.visualHelper );
}

Connector.prototype = Object.create( THREE.Object3D.prototype );
Connector.prototype.constructor = Connector;
