function Shape2d()
{
  THREE.Shape.apply( this, arguments );
  this.controlPoints = [];
}
Shape2d.prototype = Object.create( THREE.Shape.prototype );

Shape2d.prototype.moveTo= function(x,y)
{
  console.log("moveTo");
  this.controlPoints.push( new THREE.Vector3(x,y,0) );
  THREE.Shape.prototype.moveTo.call(this, x,y);
} 

Shape2d.prototype.lineTo= function(x,y)
{
  console.log("lineTo");
  this.controlPoints.push( new THREE.Vector3(x,y,0) );
  THREE.Shape.prototype.lineTo.call(this, x,y);
} 


Shape2d.prototype.bezierCurveTo= function(aCP1x, aCP1y, aCP2x, aCP2y, aX, aY)
{
  console.log("bezierCurveTo");
  this.controlPoints.push( new THREE.Vector3(aX,aY,0) );
  THREE.Shape.prototype.bezierCurveTo.call(this, aCP1x, aCP1y, aCP2x, aCP2y, aX, aY);
} 

Shape2d.prototype.fromExpression = function( expression )
{
  var expression = function (x) { return Math.cos(x); };
}

Shape2d.prototype.createPointsGeometry = function(divisions)
{
    return THREE.Shape.prototype.createPointsGeometry.call(this, divisions);
}

Shape2d.prototype.update = function()
{
  var controlPoints = this.superDuperControls;
  var actions = this.actions;
  
  //console.log("curves", this.curves);
  
  for(var i=0;i<controlPoints.length;i++)
  {
    var controlPoint = controlPoints[i];
    var argIndices = controlPoint.argIndices || [0,1];
    this.actions[controlPoint.actionIndex].args[argIndices[0]] = controlPoint.x;
    this.actions[controlPoint.actionIndex].args[argIndices[1]] = controlPoint.y;
    
    //console.log("controlPoint",controlPoints[i],"curve",controlPoints[i].originalCurve);
    /*controlPoints[i].original.x =  controlPoints[i].x;
    controlPoints[i].original.y =  controlPoints[i].y;
    
    controlPoints[i].originalCurve.needsUpdate = true;
    controlPoints[i].originalCurve.v2.copy( controlPoints[i].original );
    
    this.curves[ controlPoints[i].curveIndex ] = new THREE.LineCurve(controlPoints[i].originalCurve.v1,controlPoints[i].original);*/
  }
  
  this.cacheLengths = null;
  this.needsUpdate = true;
  
  this.renderable.geometry.dispose(); 
  delete this.renderable.__webglInit;
  
  var points = this.createPointsGeometry();
  this.renderable.geometry = points;
}

Shape2d.prototype.controlPointChanged = function(event)
{
  console.log("control point changed", event);
}

Shape2d.prototype.generateRenderables = function()
{
    this.superDuperControls = [];


    var points = this.createPointsGeometry();
		var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2 } ) );
		var controlSize = 2;
			
			function drawPointHelper( pt, color )
			{
			  var color = color || 0x3333FF;
        var pointHelper = new THREE.Mesh(new THREE.CubeGeometry(controlSize,controlSize,controlSize), new THREE.MeshBasicMaterial({color:color}));
        pointHelper.name = "Shape2dPointHelper";
        var position = new THREE.Vector3(pt.x, pt.y,0)
			  pointHelper.position= position;
			  line.add( pointHelper );
			  
			  //for testing
			  this.addEventListener('controlPointChanged', function(event) {alert("GOT THE EVENT");});
        pointHelper.dispatchEvent({type:'controlPointChanged'});
			  
			  return pointHelper;
			}
				for(var i=0;i<this.actions.length;i++)
			{
			    item = this.actions[ i ];

		    action = item.action;
		    args = item.args;

		    switch( action ) {

		    case THREE.PathActions.MOVE_TO:
          var pt = new THREE.Vector2( args[ 0 ], args[ 1 ] )
          var helper = drawPointHelper(pt);
          var pos = helper.position;
          pos.actionIndex =i;
          this.superDuperControls.push( pos );
			    break;

		    case THREE.PathActions.LINE_TO:
          var pt = new THREE.Vector2( args[ 0 ], args[ 1 ] )
          var helper = drawPointHelper(pt);
          var pos = helper.position;
          pos.actionIndex =i;
          this.superDuperControls.push( pos );
			    break;
			   
			  
			  case THREE.PathActions.BEZIER_CURVE_TO:
			    console.log("args", args);
			    var pt = new THREE.Vector2( args[ 4 ], args[ 5 ] )
          var helper = drawPointHelper(pt);
          var pos = helper.position;
          pos.actionIndex =i;
          pos.argIndices = [4,5];
          this.superDuperControls.push( pos );
          var v3 = pos;
			  
			    
			    /*pt = new THREE.Vector2( args[ 0 ], args[ 1 ] );
			    var helper = drawPointHelper(pt, 0xff00ff);
			    var pos = helper.position;
			    pos.actionIndex =i;
			    pos.argIndices = [0,1];
			    this.superDuperControls.push( pos );
			    var v1 = pos;*/
			    
			    pt = new THREE.Vector2( args[ 2 ], args[ 3 ] );
			    var bezierHelper2 =drawPointHelper(pt, 0xff00ff);
			    pos = bezierHelper2.position;
			    pos.actionIndex =i;
			    pos.argIndices = [2,3];
			    this.superDuperControls.push( pos );
			    var v2 = pos;
			    
			    //line helpers
			    /*var start = v0;
			    var end = v1;
			    var points = new THREE.Geometry();
			    points.vertices.push(  start );
			    points.vertices.push( end );
			    var helperLine = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xFF00FF, linewidth: 2 } ) );
			    line.add( helperLine )*/
			    
			    var start = v2.clone();
			    var end = v3.clone();
			    var points = new THREE.Geometry();
			    points.vertices.push( start.sub(bezierHelper2.position) );
			    points.vertices.push( end );
			    var helperLine = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xFF00FF, linewidth: 2 } ) );
          
          //add bezier control point to point
          //bezierHelper2.position = new THREE.Vector3().copy(bezierHelper2.position).sub( helper.position );
          helper.add( bezierHelper2 );
          //bezierHelper2.add( helperLine );
			    
			  break;
			  }
			}
			
		

      /*			
			for(var i=0;i<this.curves.length;i++)
			{
        if(this.curves[i] instanceof THREE.LineCurve)
        {
          var pt = this.curves[i].v2;
          var pos = drawPointHelper(pt);
          
          pos.original = pt;
          pos.originalCurve = this.curves[i];
          pos.curveIndex =1;
          
          this.superDuperControls.push( pos );
          
        }
        if(this.curves[i] instanceof THREE.CubicBezierCurve)
        {
          var pt = this.curves[i].v3;
          drawPointHelper(pt);
			    
			    var pt = this.curves[i].v1;
			    drawPointHelper(pt, 0xff00ff);
			    var pt = this.curves[i].v2;
			    drawPointHelper(pt, 0xff00ff);
			    
			    //line helpers
			    var start = this.curves[i].v0;
			    var end = this.curves[i].v1;
			    var points = new THREE.Geometry();
			    points.vertices.push(  new THREE.Vector3(start.x,start.y,0) );
			    points.vertices.push( new THREE.Vector3(end.x,end.y,0) );
			    var helperLine = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xFF00FF, linewidth: 2 } ) );
			    line.add( helperLine )
			    
			    var start = this.curves[i].v2;
			    var end = this.curves[i].v3;
			    var points = new THREE.Geometry();
			    points.vertices.push(  new THREE.Vector3(start.x,start.y,0) );
			    points.vertices.push( new THREE.Vector3(end.x,end.y,0) );
			    var helperLine = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xFF00FF, linewidth: 2 } ) );
          line.add( helperLine )
        }
			}*/
	
	  //flag the visual representation as comming from this shape2D
	  line.sourceElement = this;
	  this.renderable = line;
	  return this.renderable;
}



function Rectangle(width, height, center, radius)
{
    var width = width || 40;
    var height = height || 40;
    var radius = radius || 5;
    var center = center || new THREE.Vector3();
    
    Shape2d.apply( this, arguments );
    var x = center.x, y = center.y;
    //console.log("x,y", x,y);
    
    /*this.moveTo(  x, y );
		this.lineTo( width, y );
		this.lineTo( width, height );
		this.lineTo( x, height );
	  this.lineTo( x, y );*/
	  
	  
	  this.moveTo( x, y + radius );
		this.lineTo( x, y + height - radius );
		this.quadraticCurveTo( x, y + height, x + radius, y + height );
		this.lineTo( x + width - radius, y + height) ;
		this.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
		this.lineTo( x + width, y + radius );
		this.quadraticCurveTo( x + width, y, x + width - radius, y );
		this.lineTo( x + radius, y );
		this.quadraticCurveTo( x, y, x, y + radius );
	  
}
Rectangle.prototype = Object.create( Shape2d.prototype );

function Circle(center, radius)
{
    var radius = radius || 20;
    var center = center || new THREE.Vector3();
    
    Shape2d.apply( this, arguments );
    var x = center.x, y = center.y;
    
		this.moveTo( radius+x, y );
	  this.absarc( x, y, radius, 0, Math.PI*2, false );
	  
}
Circle.prototype = Object.create( Shape2d.prototype );

