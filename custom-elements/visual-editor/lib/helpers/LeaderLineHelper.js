/*

*/
LeaderLineHelper = function(options)
{
  BaseHelper.call( this );
  var options = options || {};

  this.distance = options.distance || 30;
  this.color = options.color || "#000000" ;
  this.text = options.text || "foo";
  this.fontSize = options.fontSize || 20;
  
  var angle = options.angle || 45;
  var radius = options.radius || 5;
  var angleLength = options.angleLength || 20; 
  var horizLength = options.horizLength || 10;

  var material = new THREE.LineBasicMaterial( { color: 0x000000, depthTest:false,depthWrite:false,renderDepth : 1e20});
 
  var rAngle = angle;
  rAngle = rAngle*Math.PI/180;
  var y = Math.cos( rAngle )*angleLength;
  var x = Math.sin( rAngle )*angleLength;
  var angleEndPoint = new THREE.Vector3( x,y,0 );
  angleEndPoint = angleEndPoint.add( angleEndPoint.clone().normalize().multiplyScalar( radius ) );
  var angleArrowDir = angleEndPoint.clone().normalize();
  angleEndPoint.x = -angleEndPoint.x;
  angleEndPoint.y = -angleEndPoint.y;
  
  this.angleArrow = new THREE.ArrowHelper(angleArrowDir, angleEndPoint, angleLength,this.color,4,2);
  this.angleArrow.scale.z =0.1;
  
  //var endLineEndPoint = arrowOffset.clone().add( new THREE.Vector3( this.endLength, 0, 0 ) ) ;
  
  var horizEndPoint = angleEndPoint.clone();
  horizEndPoint.x -= horizLength;
  
  var horizGeom = new THREE.Geometry();
  horizGeom.vertices.push( angleEndPoint );
  horizGeom.vertices.push( horizEndPoint );
  
  var horizLine = new THREE.Line( horizGeom, material );
  
  //draw dimention / text
  this.label = new LabelHelperPlane({text:this.text,fontSize:this.fontSize});
  this.label.rotation.z = Math.PI;
  var labelPosition = horizEndPoint.clone().sub(new THREE.Vector3(this.label.width/2,0,0))
  this.label.position.add( labelPosition );
 
  var crossHelper = new CrossHelper({size:3});
  this.add( crossHelper );
 
  this.add( this.angleArrow );
  this.add( horizLine );
  this.add( this.label );
}

LeaderLineHelper.prototype = Object.create( BaseHelper.prototype );
LeaderLineHelper.prototype.constructor = LeaderLineHelper;
