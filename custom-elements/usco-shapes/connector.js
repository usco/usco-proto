
function Connector(options)
{
    THREE.Object3D.call( this );
    //needs position, orientation (up vector)
    
    var options = options || {};
    
    this.up = options.up || new THREE.Vector3(0,0,1);
    this.side = options.side || new THREE.Vector3(1,0,0);
}


Connector.prototype = Object.create( THREE.Object3D.prototype );
Connector.prototype.constructor = Connector;

Connector.prototype.attachTo = function(connector)
{
  
}

Connector.prototype.detachFrom = function(connector)
{
  
}

Connector.prototype.generateRenderables=function(options)
{
  var options = options || {};
  var length = options.length || 10;
  var color  = options.color || 0xff0000;
  console.log("option", options);

  var isOutwards = false;
  var from = this.up.clone().multiplyScalar(length);
  //this.position.add  
  var to = this.position.clone().add( this.up.clone().multiplyScalar(length) );

  var lineGeometry = new THREE.Geometry();
  var vertArray = lineGeometry.vertices;
  vertArray.push( this.position.clone(), to ) ;
  lineGeometry.computeLineDistances();

  var lineMaterial = new THREE.LineDashedMaterial( { color: color, dashSize: 2, gapSize: 1, linewidth:1 } );
  var line = new THREE.Line( lineGeometry, lineMaterial );
  line.name = "connectorArrowHelper";

  var arrowHeadMaterial = new THREE.MeshBasicMaterial({color:color});
  var arrowHead = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.5, 3, 5, 5, false), arrowHeadMaterial);
  arrowHead.position = to;
  arrowHead.lookAt( to.clone().multiplyScalar(10) );
  arrowHead.rotateX(Math.PI/2);
  line.add( arrowHead );
  
  var baseRadius  = 5,
    segments = 64,
    material = new THREE.LineBasicMaterial( { color: color,linewidth:2} ),
    geometry = new THREE.CircleGeometry( baseRadius, segments );

  //geometry.vertices.shift();
  var baseIndicator = new THREE.Line( geometry, material )
  baseIndicator.position.copy( this.position );
  baseIndicator.lookAt( to.clone().multiplyScalar(10) );
  line.add( baseIndicator) ;
  
  line.material.depthTest=false;
  line.material.depthWrite=false;
  arrowHeadMaterial.depthWrite=false;
  arrowHeadMaterial.depthTest=false;
  baseIndicator.material.depthWrite=false;
  baseIndicator.material.depthTest = false;

  line.renderDepth = arrowHead.renderDepth = baseIndicator.renderDepth = 1e20 ;

  this.renderable = line ;
  return this.renderable;
}

module.exports = Connector;

