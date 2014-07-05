DistanceHelper = function(options)
{
  var options = options || {};
  var length = this.length = options.length || 50;

  var crossSize = 10;
 
  var text = this.text = options.text || this.length;
  var textSize = options.textSize || 10;

  BaseHelper.call( this );
  
  //starting point cross
  var startCrossGeometry = new THREE.Geometry();
  startCrossGeometry.vertices.push( new THREE.Vector3( 0, -crossSize/2, 0 ) );
  startCrossGeometry.vertices.push( new THREE.Vector3( 0, crossSize/2 , 0 ) );
  
  startCrossGeometry.vertices.push( new THREE.Vector3( -crossSize/2, 0, 0 ) );
  startCrossGeometry.vertices.push( new THREE.Vector3( crossSize/2, 0 , 0 ) );
  
  this.startCross = new THREE.Line( startCrossGeometry, new THREE.LineBasicMaterial( { color: 0x000000,depthTest:false,depthWrite:false,renderDepth : 1e20, opacity:0.4, transparent:true } ),THREE.LinePieces );
  this.add( this.startCross ) ;
  
  //main arrow
  this.arrow = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0 ) , length ,0x000000, 4, 2);
  this.arrow.scale.z =0.1;
  this.add( this.arrow ) ;
  
  //length label
  this.label = new LabelHelper3d({text:this.text,fontSize:this.textSize});
  this.label.position.x = length/2;
  
  this.add( this.label );
}

DistanceHelper.prototype = Object.create( BaseHelper.prototype );
DistanceHelper.prototype.constructor = DistanceHelper;
