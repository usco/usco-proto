
function Connector()
{
    THREE.Object3D.call( this );
    //needs position, orientation (up vector)
}


Connector.prototype = Object.create( THREE.Object3D.prototype );
Connector.prototype.constructor = Connector;

Connector.prototype.attachTo = function(connector)
{
  
}

Connector.prototype.detachFrom = function(connector)
{
  
}

Connector.prototype.generateRenderables=function()
{
  //this.visualHelper =  new THREE.Mesh( new THREE.CylinderGeometry( 10, 10, 20 ), new MeshBasicMaterial({color:0xff0000} );
  var color = 0xFF0000;
  var to = this.up.clone().multiplyScalar(30);

  var lineGeometry = new THREE.Geometry();
  var vertArray = lineGeometry.vertices;
  vertArray.push( this.position.clone(),to) ;
  lineGeometry.computeLineDistances();

  var lineMaterial = new THREE.LineDashedMaterial( { color: color, dashSize: 2, gapSize: 1, linewidth:2 } );
  var line = new THREE.Line( lineGeometry, lineMaterial );
  line.name = "connectorArrowHelper";

  var arrowHeadMaterial = new THREE.MeshBasicMaterial({color:color});
  var arrowHead = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.5, 3, 5, 5, false), arrowHeadMaterial);
  arrowHead.position = to;
  arrowHead.lookAt( to.clone().multiplyScalar(10) );
  arrowHead.rotateX(Math.PI/2);
  line.add( arrowHead );
  
  //var baseIndicator = new THREE.Mesh(new THREE.CubeGeometry(baseSize,baseSize,baseSize),new THREE.MeshBasicMaterial({color:color,wireframe:true}) );
  
  var baseRadius  = 5,
    segments = 64,
    material = new THREE.LineBasicMaterial( { color: 0x000000 , depthTest:false,linewidth:2} ),
    geometry = new THREE.CircleGeometry( baseRadius, segments );

  //geometry.vertices.shift();
  var baseIndicator = new THREE.Line( geometry, material )
  baseIndicator.position.copy( this.position );
  line.add( baseIndicator) ;

  lineMaterial.depthWrite=true;
  lineMaterial.depthTest=false;
  arrowHeadMaterial.depthWrite=true;
  arrowHeadMaterial.depthTest=false;
  
  arrowHead.renderDepth = 1e20;
  line.renderDepth = 1e20;
  baseIndicator.renderDepth = 1e20;

  this.renderable = line ;
  return this.renderable;
}

