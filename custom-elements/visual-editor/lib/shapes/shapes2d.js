//HELPER, not so sure about this:

THREE.Vector3.fromVector2 = function( vec2 )
{
    return new THREE.Vector3(vec2.x, vec2.y, 0);
}

function Shape2d()
{
  THREE.Shape.apply( this, arguments );
  this.id = Shape2d.__id++;
  this.controlPoints = [];
}
Shape2d.prototype = Object.create( THREE.Shape.prototype );
Shape2d.__id = 0;

//this needs to inject new lineTo, bezierCurveTo elements
Shape2d.prototype.addPoint = function(x, y)
{
  throw new Error("Not implemented yet");
  //this.getPoint(x,y);
}

Shape2d.prototype.moveTo= function(x,y)
{
  console.log("moveTo");
  //this.controlPoints.push( new THREE.Vector3(x,y,0) );
  var args = Array.prototype.slice.call( arguments );
  var controlPoint = new THREE.Vector2( x, y );
  controlPoint.index = this.actions.length;
  this.controlPoints.push( controlPoint );

  
	this.actions.push( { action: THREE.PathActions.MOVE_TO, args: args, args2:controlPoint } );
  
  //THREE.Shape.prototype.moveTo.call(this, x,y);
} 

Shape2d.prototype.lineTo= function(x,y)
{
  console.log("lineTo");
  //this.controlPoints.push( new THREE.Vector3(x,y,0) );
  var args = Array.prototype.slice.call( arguments );
  var endPoint = new THREE.Vector2( x, y );
  endPoint.index = this.actions.length;
  this.controlPoints.push( endPoint );

	var lastArgs = this.actions[ this.actions.length - 1 ].args2;
	var prevPoint= lastArgs;

	var curve = new THREE.LineCurve( prevPoint, endPoint );
	this.curves.push( curve );
	this.actions.push( { action: THREE.PathActions.LINE_TO, args: args, args2:endPoint } );
} 

Shape2d.prototype.bezierCurveTo= function(aCP1x, aCP1y, aCP2x, aCP2y, aX, aY)
{
  console.log("bezierCurveTo");
  this.controlPoints.push( new THREE.Vector3(aX,aY,0) );
  THREE.Shape.prototype.bezierCurveTo.call(this, aCP1x, aCP1y, aCP2x, aCP2y, aX, aY);
} 

Shape2d.prototype.quadraticCurveTo = function( aCPx, aCPy, aX, aY )
{
  console.log("quadraticCurveTo");
  var args = Array.prototype.slice.call( arguments );
  var endPoint = new THREE.Vector2( aX, aY );
  endPoint.index = this.actions.length;
  this.controlPoints.push( endPoint );

  var lastArgs = this.actions[ this.actions.length - 1 ].args2;
	var prevPoint= lastArgs;
	
	var curveControlPoint = new THREE.Vector2( aCPx, aCPy );
  curveControlPoint.index = this.actions.length;

	var curve = new THREE.QuadraticBezierCurve( prevPoint,
												curveControlPoint,
												endPoint );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.QUADRATIC_CURVE_TO, args: args, args2:endPoint,args3:curveControlPoint } );
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
        var position = THREE.Vector3.fromVector2( pt ); //new THREE.Vector3(pt.x, pt.y,0)
			  pointHelper.position= position;
			  line.add( pointHelper );
			  
			  //for testing: update the 2d point the helper stands in for based on the helper's position
			  pointHelper.addEventListener('translated', function(event) {
			    //console.log("control point translated",event,this);
			    this.standInFor.x = this.position.x;
			    this.standInFor.y = this.position.y;
			  });
			  
			  return pointHelper;
			}
				for(var i=0;i<this.actions.length;i++)
			{
			    item = this.actions[ i ];

		    action = item.action;
		    args = item.args;
		    args2 = item.args2;

		    switch( action ) {

		    case THREE.PathActions.MOVE_TO:
		      console.log("case MoveTo, args", args2);
          var pt = args2;//new THREE.Vector2( args[ 0 ], args[ 1 ] )
          var helper = drawPointHelper(pt);
          helper.standInFor = pt;
          var pos = helper.position;
          pos.actionIndex =i;
          this.superDuperControls.push( pos );
			    break;
			    
		    case THREE.PathActions.LINE_TO:
		      console.log("case LINETo, args", args2);
          var pt = args2;//new THREE.Vector2( args[ 0 ], args[ 1 ] )
          var helper = drawPointHelper(pt);
          helper.standInFor = pt;
          var pos = helper.position;
          pos.actionIndex =i;
          this.superDuperControls.push( pos );
			    break;
			   
			  case THREE.PathActions.QUADRATIC_CURVE_TO:
			    var pt = args2;//new THREE.Vector2( args[ 2 ], args[ 3 ] )
          var helper = drawPointHelper(pt);
          helper.standInFor = pt;
          var pos = helper.position;
          pos.actionIndex =i;
          pos.argIndices = [2,3];
          this.superDuperControls.push( pos );
          
          var args3 = item.args3;
          pt = args3;//new THREE.Vector2( args[ 0 ], args[ 1] );
			    var curveHelper =drawPointHelper(pt, 0xff00ff);
			    curveHelper.standInFor = pt;
			    pos = curveHelper.position;
			    pos.actionIndex =i;
			    pos.argIndices = [0,1];
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
			    case THREE.PathActions.ELLIPSE:
			      //aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise
			      var pt = new THREE.Vector2( args[ 0 ], args[ 1 ] )
            var helper = drawPointHelper(pt);
            var pos = helper.position;
            pos.actionIndex =i;
            pos.argIndices = [0,1];
            this.superDuperControls.push( pos );
            
            //radius controls
            pt = new THREE.Vector2( args[ 2 ], args[ 3 ] );
			      var radiusHelper =drawPointHelper(pt, 0xff00ff);
			      pos = radiusHelper.position;
			      pos.actionIndex =i;
			      pos.argIndices = [2,3];
			      this.superDuperControls.push( pos );
			      
			      //angle controls
            pt = new THREE.Vector2( args[ 4 ], args[ 5 ] );
			      var angleHelper =drawPointHelper(pt, 0xff00ff);
			      pos = angleHelper.position;
			      pos.actionIndex =i;
			      pos.argIndices = [4,5];
			      this.superDuperControls.push( pos );
            
            
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

/* Return an array of vectors based on contour of the path */

Shape2d.prototype.getPoints = function( divisions, closedPath ) {
	if (this.useSpacedPoints) {
		console.log('tata');
		return this.getSpacedPoints( divisions, closedPath );
	}

	divisions = divisions || 12;

	var points = [];

	var i, il, item, action, args;
	var cpx, cpy, cpx2, cpy2, cpx1, cpy1, cpx0, cpy0,
		laste, j,
		t, tx, ty;

	for ( i = 0, il = this.actions.length; i < il; i ++ ) {

		item = this.actions[ i ];

		action = item.action;
		args = item.args;
		args2 = item.args2;
		args3 = item.args3;

		switch( action ) {

		case THREE.PathActions.MOVE_TO:

			points.push( args2 );

			break;

		case THREE.PathActions.LINE_TO:

			points.push( args2 );

			break;

		case THREE.PathActions.QUADRATIC_CURVE_TO:

			cpx  = args2.x;
			cpy  = args2.y;

      cpx1 = args3.x;
      cpy1 = args3.y;

			if ( points.length > 0 ) {

				last = points[ points.length - 1 ];
				cpx0 = last.x;
				cpy0 = last.y;

			} else {
        console.log("gne");
				last = this.actions[ i - 1 ].args2;

        cpx0 = last.x;
        cpy0 = last.y;
				//cpx0 = laste[ laste.length - 2 ];
				//cpy0 = laste[ laste.length - 1 ];

			}

			for ( j = 1; j <= divisions; j ++ ) {

				t = j / divisions;

				tx = THREE.Shape.Utils.b2( t, cpx0, cpx1, cpx );
				ty = THREE.Shape.Utils.b2( t, cpy0, cpy1, cpy );

				points.push( new THREE.Vector2( tx, ty ) );

			}

			break;

		case THREE.PathActions.BEZIER_CURVE_TO:

			cpx  = args[ 4 ];
			cpy  = args[ 5 ];

			cpx1 = args[ 0 ];
			cpy1 = args[ 1 ];

			cpx2 = args[ 2 ];
			cpy2 = args[ 3 ];

			if ( points.length > 0 ) {

				laste = points[ points.length - 1 ];

				cpx0 = laste.x;
				cpy0 = laste.y;

			} else {

				laste = this.actions[ i - 1 ].args;

				cpx0 = laste[ laste.length - 2 ];
				cpy0 = laste[ laste.length - 1 ];

			}


			for ( j = 1; j <= divisions; j ++ ) {

				t = j / divisions;

				tx = THREE.Shape.Utils.b3( t, cpx0, cpx1, cpx2, cpx );
				ty = THREE.Shape.Utils.b3( t, cpy0, cpy1, cpy2, cpy );

				points.push( new THREE.Vector2( tx, ty ) );

			}

			break;

		case THREE.PathActions.CSPLINE_THRU:

			laste = this.actions[ i - 1 ].args;

			var last = new THREE.Vector2( laste[ laste.length - 2 ], laste[ laste.length - 1 ] );
			var spts = [ last ];

			var n = divisions * args[ 0 ].length;

			spts = spts.concat( args[ 0 ] );

			var spline = new THREE.SplineCurve( spts );

			for ( j = 1; j <= n; j ++ ) {

				points.push( spline.getPointAt( j / n ) ) ;

			}

			break;

		case THREE.PathActions.ARC:

			var aX = args[ 0 ], aY = args[ 1 ],
				aRadius = args[ 2 ],
				aStartAngle = args[ 3 ], aEndAngle = args[ 4 ],
				aClockwise = !!args[ 5 ];

			var deltaAngle = aEndAngle - aStartAngle;
			var angle;
			var tdivisions = divisions * 2;

			for ( j = 1; j <= tdivisions; j ++ ) {

				t = j / tdivisions;

				if ( ! aClockwise ) {

					t = 1 - t;

				}

				angle = aStartAngle + t * deltaAngle;

				tx = aX + aRadius * Math.cos( angle );
				ty = aY + aRadius * Math.sin( angle );

				//console.log('t', t, 'angle', angle, 'tx', tx, 'ty', ty);

				points.push( new THREE.Vector2( tx, ty ) );

			}

			//console.log(points);

		  break;

		case THREE.PathActions.ELLIPSE:

			var aX = args[ 0 ], aY = args[ 1 ],
				xRadius = args[ 2 ],
				yRadius = args[ 3 ],
				aStartAngle = args[ 4 ], aEndAngle = args[ 5 ],
				aClockwise = !!args[ 6 ];


			var deltaAngle = aEndAngle - aStartAngle;
			var angle;
			var tdivisions = divisions * 2;

			for ( j = 1; j <= tdivisions; j ++ ) {

				t = j / tdivisions;

				if ( ! aClockwise ) {

					t = 1 - t;

				}

				angle = aStartAngle + t * deltaAngle;

				tx = aX + xRadius * Math.cos( angle );
				ty = aY + yRadius * Math.sin( angle );

				//console.log('t', t, 'angle', angle, 'tx', tx, 'ty', ty);

				points.push( new THREE.Vector2( tx, ty ) );

			}

			//console.log(points);

		  break;

		} // end switch

	}



	// Normalize to remove the closing point by default.
	var lastPoint = points[ points.length - 1];
	var EPSILON = 0.0000000001;
	if ( Math.abs(lastPoint.x - points[ 0 ].x) < EPSILON &&
			 Math.abs(lastPoint.y - points[ 0 ].y) < EPSILON)
		points.splice( points.length - 1, 1);
	if ( closedPath ) {

		points.push( points[ 0 ] );

	}

	return points;

};



function Rectangle(width, height, center, radius)
{
    var width = width || 40;
    var height = height || 40;
    var radius = radius || 5;
    var center = center || new THREE.Vector3();
    
    Shape2d.apply( this, arguments );
    var x = center.x, y = center.y;
	  
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
Rectangle.prototype.constructor = Rectangle;

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
Circle.prototype.constructor = Circle;

