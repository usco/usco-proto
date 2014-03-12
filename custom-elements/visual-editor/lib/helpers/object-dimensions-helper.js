
/*
  Made of one main arrow, and two lines perpendicular to the main arrow, at both its ends
*/
SizeArrowHelper = function(mainLength, sideLength, position, direction, color, text, textSize)
{
  THREE.Object3D.call( this );
  this.up = new THREE.Vector3(0,0,1);
  //this.start = start;
  //this.end = end;

  var position = position || new THREE.Vector3();
  var direction = direction || new THREE.Vector3();
  this.mainLength = mainLength || 10;
  this.sideLength = sideLength || 2;
  this.color = color || "#000000" ;
  this.text = text || this.mainLength;
  var textSize = textSize || 12;

  //direction, origin, length, color, headLength, headRadius, headColor
  //var direction = this.start.clone().sub(this.end).normalize();
  //console.log("direction",direction);

  var mainArrowLeft = new THREE.ArrowHelper2(new THREE.Vector3(1,0,0),new THREE.Vector3(0,0,0),mainLength/2-3 , this.color);
  var mainArrowRight = new THREE.ArrowHelper2(new THREE.Vector3(-1,0,0),new THREE.Vector3(0,0,0),mainLength/2-3, this.color);
  this.add( mainArrowLeft );
  this.add( mainArrowRight );

  var sideLineGeometry = new THREE.Geometry();
  sideLineGeometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
  sideLineGeometry.vertices.push( new THREE.Vector3( 0, sideLength, 0 ) );
  
  var leftSideLine = new THREE.Line( sideLineGeometry, new THREE.LineBasicMaterial( { color: 0x000000,depthTest:false,depthWrite:false,renderDepth : 1e20 } ) );
  leftSideLine.position.x = -this.mainLength / 2;

  var rightSideLine = new THREE.Line( sideLineGeometry, new THREE.LineBasicMaterial( { color: 0x000000,depthTest:false,depthWrite:false,renderDepth : 1e20 } ) );
  rightSideLine.position.x = this.mainLength / 2;
  
  //draw dimention / text
  this.label = new THREE.TextDrawHelper().drawText(this.text,textSize);
  this.label.position.y = -2;

  this.add( rightSideLine );
  this.add( leftSideLine );

  this.add( this.label );

  this.position = position; 

  var angle = new THREE.Vector3(1,0,0).angleTo(direction); //new THREE.Vector3(1,0,0).cross( direction );
  this.setRotationFromAxisAngle(direction,angle);

  leftSideLine.renderDepth = 1e20;
  rightSideLine.renderDepth = 1e20;
  mainArrowLeft.renderDepth = 1e20;
  mainArrowRight.renderDepth = 1e20;
}

SizeArrowHelper.prototype = Object.create( THREE.Object3D.prototype );


/*
  Made of one main arrow, and two lines perpendicular to the main arrow, at both its ends
*/
DiameterHelper = function(diameter, distance, endLength, color)
{
  THREE.Object3D.call( this );

  this.distance = distance || 30;
  this.diameter = diameter || 20;
  this.endLength = endLength || 20;
  this.color = color || "#000000" ;
  this.text = this.diameter;

  var material = new THREE.LineBasicMaterial( { color: 0x000000, depthTest:false,depthWrite:false,renderDepth : 1e20});
 
  //center cross
  var centerCrossSize = 10;
  var centerCrossGeometry1 = new THREE.Geometry();
  centerCrossGeometry1.vertices.push( new THREE.Vector3( -centerCrossSize, 0, 0 ) );
  centerCrossGeometry1.vertices.push( new THREE.Vector3( centerCrossSize, 0, 0 ) );
  var centerCrossGeometry2 = new THREE.Geometry();
  centerCrossGeometry2.vertices.push( new THREE.Vector3( 0, -centerCrossSize, 0 ) );
  centerCrossGeometry2.vertices.push( new THREE.Vector3( 0, centerCrossSize, 0 ) );
  var centerCross1 = new THREE.Line( centerCrossGeometry1, material );
  var centerCross2 = new THREE.Line( centerCrossGeometry2, material );

  //draw arrow
  var arrowOffset = new THREE.Vector3(Math.sqrt(this.distance)*2+this.diameter/2,Math.sqrt(this.distance)*2+this.diameter/2,0);
  var mainArrow = new THREE.ArrowHelper2(new THREE.Vector3(-1,-1,0),new THREE.Vector3(),this.distance , this.color);
  mainArrow.position.add(arrowOffset);

  var endLineEndPoint = arrowOffset.clone().add( new THREE.Vector3( this.endLength, 0, 0 ) ) ;
  var endLineGeometry = new THREE.Geometry();
  endLineGeometry.vertices.push( arrowOffset );
  endLineGeometry.vertices.push( endLineEndPoint ); 
   var endLine = new THREE.Line( endLineGeometry, material );

  //draw dimention / text
  this.label = new THREE.TextDrawHelper().drawTextOnPlane(this.text,45);
  this.label.position.add( endLineEndPoint );
  //TODO: account for size of text instead of these hacks
  this.label.position.x += 5
  this.label.position.y -= 2
  
  
  //draw main circle
  var circleRadius = this.diameter/2;
  var circleShape = new THREE.Shape();
	circleShape.moveTo( 0, 0 );
	circleShape.absarc( 0, 0, circleRadius, 0, Math.PI*2, false );
  var points  = circleShape.createSpacedPointsGeometry( 100 );
  var diaCircle = new THREE.Line(points, material );

  //add all
  this.add( diaCircle );
  this.add( mainArrow );
  this.add( endLine );
  this.add( this.label );
  this.add( centerCross1 );
  this.add( centerCross2 );
}

DiameterHelper.prototype = Object.create( THREE.Object3D.prototype );


/*----------------------------------------------*/

ObjectDimensionsHelper = function (options) {
  THREE.Object3D.call( this );
  var options = options || {};
  var color = options.color || 0x000000;
  var mesh = options.mesh || this.parent || null;

  var cage = new THREE.Object3D()
  var lineMat = new THREE.MeshBasicMaterial({color: color, wireframe: true, shading:THREE.FlatShading});

  //console.log("mesh",mesh)

  this.getBounds(mesh);
  var delta = this.computeMiddlePoint(mesh);
  cage.position = delta
  
  var widthArrowPos = new THREE.Vector3(delta.x+this.length/2+10,delta.y,delta.z-this.height/2); 
  var lengthArrowPos = new THREE.Vector3( delta.x, delta.y+this.width/2+10, delta.z-this.height/2)
  var heightArrowPos = new THREE.Vector3( delta.x-this.length/2-5,delta.y-this.width/2-5,delta.z)

  //console.log("width", this.width, "length", this.length, "height", this.height,"delta",delta, "widthArrowPos", widthArrowPos)

  dashMaterial = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 2.5, gapSize: 2, depthTest: false,linewidth:1} )
  baseCubeGeom = new THREE.CubeGeometry(this.length, this.width,this.height)

  var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-this.length/2, -this.width/2, 0));
    geometry.vertices.push(new THREE.Vector3(this.length/2, -this.width/2, 0));
    geometry.vertices.push(new THREE.Vector3(this.length/2, this.width/2, 0));
    geometry.vertices.push(new THREE.Vector3(-this.length/2, this.width/2, 0));
    geometry.vertices.push(new THREE.Vector3(-this.length/2, -this.width/2, 0));
    
  
  geometry.computeLineDistances();

  var baseOutline = new THREE.Line( geometry, dashMaterial, THREE.Lines );
  baseOutline.renderDepth = 1e20
  baseOutline.position = new THREE.Vector3(delta.x,delta.y,delta.z-this.height/2)
  this.add(baseOutline);


  var bla = new THREE.Mesh(baseCubeGeom,new THREE.MeshBasicMaterial({wireframe:true,color:0xff0000}))
  bla.position = new THREE.Vector3(delta.x,delta.y,delta.z);
  //this.add( bla )
  

  var sideLength =10;
  var widthArrow = new SizeArrowHelper(this.width,sideLength,widthArrowPos,new THREE.Vector3(0,0,1));
  var lengthArrow = new SizeArrowHelper(this.length,-sideLength,lengthArrowPos,new THREE.Vector3(1,0,0));
  var heightArrow = new SizeArrowHelper(this.height,sideLength,heightArrowPos,new THREE.Vector3(0,1,0));
        
  this.add( widthArrow );
  this.add( lengthArrow );
  this.add( heightArrow );

}

ObjectDimensionsHelper.prototype = Object.create( THREE.Object3D.prototype );

ObjectDimensionsHelper.prototype.computeMiddlePoint=function(mesh)
{
  var middle  = new THREE.Vector3()
  middle.x  = ( mesh.boundingBox.max.x + mesh.boundingBox.min.x ) / 2;
  middle.y  = ( mesh.boundingBox.max.y + mesh.boundingBox.min.y ) / 2;
  middle.z  = ( mesh.boundingBox.max.z + mesh.boundingBox.min.z ) / 2;
  //console.log("mid",geometry.boundingBox.max.z,geometry.boundingBox.min.z, geometry.boundingBox.max.z+geometry.boundingBox.min.z)
  return middle;
}

ObjectDimensionsHelper.prototype.getBounds=function(mesh)
{
  if( !(mesh.boundingBox))
  {
    //TODO: "meshes" should have bounding box/sphere informations, not just shapes/geometries should have it
      mesh.boundingBox = computeObject3DBoundingBox(mesh);
  }
  var bbox = mesh.boundingBox;

  var length = (bbox.max.x-bbox.min.x).toFixed(2);
  var width  = (bbox.max.y-bbox.min.y).toFixed(2);
  var height = (bbox.max.z-bbox.min.z).toFixed(2);

  this.width = width;
  this.height = height;
  this.length = length;

  return [length,width, height];
}
          
