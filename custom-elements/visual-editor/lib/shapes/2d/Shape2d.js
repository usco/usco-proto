//HELPER, not so sure about this:

THREE.Vector3.fromVector2 = function( vec2 )
{
    return new THREE.Vector3(vec2.x, vec2.y, 0);
}

function Shape2d()
{
  THREE.Shape.apply( this, arguments );
  this.id = Shape2d.__id++;
  this.name = this.constructor.name;
  this.controlPoints = [];
  
  this.__visualContols = [];
  
  this.properties = {};
}
Shape2d.prototype = Object.create( THREE.Shape.prototype );
Shape2d.__id = 0;

//this needs to inject new lineTo, bezierCurveTo elements
//it might require some additional data from the visual editing side of things
// ie finding out which curve/action we want to split/subdivide
Shape2d.prototype.addPoint = function(x, y)
{
  throw new Error("Not implemented yet");
  //this.getPoint(x,y);
}

Shape2d.prototype.removePoint = function( point )
{
  //throw new Error("Not implemented yet");
  for(var i=this.curves.length-1;i>=0;i--)
  {
    var curve = this.curves[i];
    if(point == curve.v1 || point == curve.v2)
    {
      console.log("removing curve", curve);
      var idx = this.curves.indexOf(curve);
      this.curves.splice(idx, 1);
    }
  }
  for(var i=this.actions.length-1;i>=0;i--)
  {
    var action = this.actions[i];
    console.log("action", action);
    if(point == action.args2)
    {
      console.log("removing action", action);
      var idx = this.actions.indexOf(action);
      this.actions.splice(idx, 1);
    }
  }
  
  var idx = this.controlPoints.indexOf(point);
  this.controlPoints.splice(idx,1);
    
  this.update();
}

Shape2d.prototype.fromExpression = function( expression )
{
  var expression = function (x) { return Math.cos(x); };
}

Shape2d.prototype.union = function ( otherShape2d)
{
    throw new Error("Not implemented yet");
}

Shape2d.prototype.subtract = function ( otherShape2d)
{
  throw new Error("Not implemented yet");
}

Shape2d.prototype.intersect = function ( otherShape2d)
{
  throw new Error("Not implemented yet");
}


Shape2d.prototype.moveTo= function(x,y)
{
  console.log("moveTo");
  var args = Array.prototype.slice.call( arguments );
  var startPoint = new THREE.Vector2( x, y );
  startPoint.index = this.actions.length;
  this.controlPoints.push( startPoint );
  
	this.actions.push( { action: THREE.PathActions.MOVE_TO, args: args, args2:startPoint } );
} 

Shape2d.prototype.lineTo= function(x,y)
{
  console.log("lineTo");
  var args = Array.prototype.slice.call( arguments );
  var endPoint = new THREE.Vector2( x, y );
  endPoint.index = this.actions.length;
  endPoint.curves = [];
  this.controlPoints.push( endPoint );

	var lastArgs = this.actions[ this.actions.length - 1 ].args2;
	var prevPoint= lastArgs;

	var curve = new THREE.LineCurve( prevPoint, endPoint );
	//prevPoint.curves.push(curve);
	//endPoint.curves.push(curve);
	
	this.curves.push( curve );
	this.actions.push( { action: THREE.PathActions.LINE_TO, args: args, args2:endPoint } );
} 

Shape2d.prototype.quadraticCurveTo = function( aCPx, aCPy, aX, aY )
{
  console.log("quadraticCurveTo");
  var args = Array.prototype.slice.call( arguments );
  var endPoint = new THREE.Vector2( aX, aY );
  endPoint.index = this.actions.length;
  endPoint.curves = [];
  this.controlPoints.push( endPoint );

  var lastArgs = this.actions[ this.actions.length - 1 ].args2;
	var prevPoint= lastArgs;
	
	var curveControlPoint = new THREE.Vector2( aCPx, aCPy );
  curveControlPoint.index = this.actions.length;

	var curve = new THREE.QuadraticBezierCurve( prevPoint,
												curveControlPoint,
												endPoint );
	this.curves.push( curve );
	//prevPoint.curves.push(curve);
	//endPoint.curves.push(curve);

	this.actions.push( { action: THREE.PathActions.QUADRATIC_CURVE_TO, args: args, args2:endPoint,args3:curveControlPoint } );
}

Shape2d.prototype.bezierCurveTo= function(aCP1x, aCP1y, aCP2x, aCP2y, aX, aY)
{
  console.log("bezierCurveTo");
  var args = Array.prototype.slice.call( arguments );
  
  var endPoint = new THREE.Vector2( aX, aY );
  endPoint.index = this.actions.length;
  this.controlPoints.push( endPoint );

	var lastArgs = this.actions[ this.actions.length - 1 ].args2;
  var prevPoint = lastArgs;

	var bezierCurveControlPoint1 = new THREE.Vector2( aCP1x, aCP1y );
  var bezierCurveControlPoint2 = new THREE.Vector2( aCP2x, aCP2y );
	var args3 = [bezierCurveControlPoint1,bezierCurveControlPoint2];

	var curve = new THREE.CubicBezierCurve( prevPoint,
											bezierCurveControlPoint1,
											bezierCurveControlPoint2,
											endPoint );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.BEZIER_CURVE_TO, args: args, args2:endPoint,args3:bezierCurveControlPoint1,args4:bezierCurveControlPoint2 } );
} 

// FUTURE: Change the API or follow canvas API?

Shape2d.prototype.arc = function ( aX, aY, aRadius,
									  aStartAngle, aEndAngle, aClockwise ) {

	var lastargs = this.actions[ this.actions.length - 1].args;
	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	this.absarc(aX + x0, aY + y0, aRadius,
		aStartAngle, aEndAngle, aClockwise );

 };

 Shape2d.prototype.absarc = function ( aX, aY, aRadius,
									  aStartAngle, aEndAngle, aClockwise ) {
	  this.absellipse(aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise);
 };

Shape2d.prototype.ellipse = function ( aX, aY, xRadius, yRadius,
									  aStartAngle, aEndAngle, aClockwise ) {

	var lastargs = this.actions[ this.actions.length - 1].args;
	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	this.absellipse(aX + x0, aY + y0, xRadius, yRadius,
		aStartAngle, aEndAngle, aClockwise );

 };


Shape2d.prototype.absellipse = function ( aX, aY, xRadius, yRadius,
									  aStartAngle, aEndAngle, aClockwise ) {

	var args = Array.prototype.slice.call( arguments );
	
	var endPoint = new THREE.Vector2(aX,aY);
  endPoint.index = this.actions.length;
  this.controlPoints.push( endPoint );
  
  //var radiusControlPoint = new THREE.Vector2(xRadius, yRadius);
	
	
	var curve = new THREE.EllipseCurve( endPoint.x, endPoint.y, xRadius, yRadius,
									aStartAngle, aEndAngle, aClockwise );
	this.curves.push( curve );

	var lastPoint = curve.getPoint(1);
	args.push(lastPoint.x);
	args.push(lastPoint.y);
	

	this.actions.push( { action: THREE.PathActions.ELLIPSE, args: args, args2:lastPoint } );

 };


Shape2d.prototype.createPointsGeometry = function(divisions)
{
    return THREE.Shape.prototype.createPointsGeometry.call(this, divisions);
}


Shape2d.prototype.update = function( parameters )
{
  
  for (var key in parameters)
  {
    if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key) )
    {
      //console.log("updating"+key + " -> " + parameters[key]);
      this[key] = parameters[key];
    }
  }

  var controlPoints = this.__visualContols;
  var actions = this.actions;
  
  /*for(var i=0;i<controlPoints.length;i++)
  {
    var controlPoint = controlPoints[i];
    var argIndices = controlPoint.argIndices || [0,1];
    this.actions[controlPoint.actionIndex].args[argIndices[0]] = controlPoint.x;
    this.actions[controlPoint.actionIndex].args[argIndices[1]] = controlPoint.y;
  }*/
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


Shape2d.prototype.generateVisualControlPoints = function()
{
  var line = this.renderable;
  var self = this;			
  var controlSize = 1.5;
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
	    if(this.linkedLines)
	    {
	      this.linkedLines.geometry.verticesNeedUpdate = true;
	    }
	  });

			  pointHelper.addEventListener('deleted', function(event) {
			    console.log("control point deleted",this);
			    self.removePoint( this.standInFor );
			    //this.standInFor.x = this.position.x;
			  });
			  
			  return pointHelper;
			}
		  var prevEndHelper = null;//pointer to the helper fo the end of the last "curve"/action
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
          helper.sourceParent = this;
          var pos = helper.position;
          pos.actionIndex =i;
          this.__visualContols.push( pos );
          
          prevEndHelper = helper;
			    break;
			    
		    case THREE.PathActions.LINE_TO:
		      console.log("case LINETo, args", args2);
          var pt = args2;//new THREE.Vector2( args[ 0 ], args[ 1 ] )
          var helper = drawPointHelper(pt);
          helper.standInFor = pt;
          helper.sourceParent = this;
          var pos = helper.position;
          pos.actionIndex =i;
          this.__visualContols.push( pos );
          prevEndHelper = helper;
			    break;
			   
			  case THREE.PathActions.QUADRATIC_CURVE_TO:
			  
			    var pt = args2;
          var helper = drawPointHelper(pt);
          //we add information about the origins of the visual helper
          helper.standInFor = pt;
          helper.sourceParent = this;
          
          var pos = helper.position;
          pos.actionIndex =i;
          pos.argIndices = [2,3];
          this.__visualContols.push( pos );
          
          var args3 = item.args3;
          pt = args3;
			    var curveHelper = drawPointHelper(pt, 0xff00ff);
			    curveHelper.standInFor = pt;
			    curveHelper.sourceParent = this;
			    pos = curveHelper.position;
			    pos.actionIndex =i;
			    pos.argIndices = [0,1];
			    this.__visualContols.push( pos );
			    
			    //line helpers
			    var start = prevEndHelper.position;
			    var mid = curveHelper.position;
			    var end = helper.position;
			    var points = new THREE.Geometry();
			    points.vertices.push( start );
			    points.vertices.push( mid );
			    points.vertices.push( end );
			    var helperLine = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xFF00FF, linewidth: 2 } ) );
			    line.add( helperLine );
			    
			    //flag helperLine as linked to the various helpers, so it can be auto-updated when they change position
			    helper.linkedLines = helperLine;
			    curveHelper.linkedLines = helperLine;
			    prevEndHelper.linkedLines = helperLine;
          
          prevEndHelper = helper;
          break;
			  
			  case THREE.PathActions.BEZIER_CURVE_TO:
			    console.log("case BEZIERTo, args", args2, args3);
			    var pt = args2;//new THREE.Vector2( args[ 4 ], args[ 5 ] )
          var helper = drawPointHelper(pt);
          helper.standInFor = pt;
          helper.sourceParent = this;
          var pos = helper.position;
          pos.actionIndex =i;
          pos.argIndices = [4,5];
          this.__visualContols.push( pos );
			    
			    pt = item.args3; //new THREE.Vector2( args[ 2 ], args[ 3 ] );
			    var bezierHelper = drawPointHelper(pt, 0xff00ff);
			    bezierHelper.standInFor = pt;
          bezierHelper.sourceParent = this;
			    pos = bezierHelper.position;
			    pos.actionIndex =i;
			    pos.argIndices = [2,3];
			    this.__visualContols.push( pos );
			    
			    pt = item.args4; //new THREE.Vector2( args[ 2 ], args[ 3 ] );
			    var bezierHelper2 = drawPointHelper(pt, 0xff00ff);
			    bezierHelper2.standInFor = pt;
          bezierHelper2.sourceParent = this;
			    pos = bezierHelper2.position;
			    this.__visualContols.push( pos );
			    
			    //line helpers
			    break;
			  case THREE.PathActions.ELLIPSE:
			      //aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise
			      console.log("elipse", args2);
			      var pt = args2;//new THREE.Vector2( args[ 0 ], args[ 1 ] )
            var helper = drawPointHelper(pt);
            helper.standInFor = pt;
            helper.sourceParent = this;
            var pos = helper.position;
            pos.actionIndex =i;
            pos.argIndices = [0,1];
            this.__visualContols.push( pos );
            
            //radius controls
            pt = new THREE.Vector2( args[ 2 ], args[ 3 ] );
			      var radiusHelper =drawPointHelper(pt, 0xff00ff);
			      pos = radiusHelper.position;
			      pos.actionIndex =i;
			      pos.argIndices = [2,3];
			      this.__visualContols.push( pos );
			      
			      
			      //angle controls
            pt = new THREE.Vector2( args[ 4 ], args[ 5 ] );
			      var angleHelper =drawPointHelper(pt, 0xff00ff);
			      pos = angleHelper.position;
			      pos.actionIndex =i;
			      pos.argIndices = [4,5];
			      this.__visualContols.push( pos );
            
            prevEndHelper = helper;
            
			    break;
			  }
			  
			}
	
}

Shape2d.prototype.generateRenderables = function()
{
    var points = this.createPointsGeometry();
		var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2 } ) );
		
		line.addEventListener('translated', function(event) {
		  console.log("I AM BEEN TRANSLATED");
	  });
	  
	  //flag the visual representation as comming from this shape2D
	  line.sourceShape = this;
	  this.renderable = line;
	  this.generateVisualControlPoints(); 
	  
	  return this.renderable;
}

Shape2d.prototype.updateRenderables=function()
{
  for(var i=0;i< this.renderable.children.length;i++)
  {
    var child = this.renderable.children[i];
    this.renderable.remove( child );
  }
  
  this.renderable.geometry.dispose(); 
  delete this.renderable.__webglInit;
  
  //this.generateVisualControlPoints();
  
  var points = this.createPointsGeometry();
  this.renderable.geometry = points;
}


Shape2d.prototype.fromThreeShape = function(shape)
{
  console.log("source shape", shape);
  for(var i=0; i<shape.actions.length;i++)
  {
    var action = shape.actions[i];
    console.log("action", action.action);
    switch(action.action)
    {
      case THREE.PathActions.MOVE_TO:
        this.moveTo(action.args[0], action.args[1]);
      break; 
      case THREE.PathActions.LINE_TO:
		    this.lineTo(action.args[0], action.args[1]);
			break;
		  case THREE.PathActions.QUADRATIC_CURVE_TO:
        this.quadraticCurveTo(action.args[0], action.args[1],action.args[2], action.args[3]  );
      break;
      case THREE.PathActions.BEZIER_CURVE_TO:
        //console.log("action, bezier", action.args);
        //this.quadraticCurveTo(Math.abs(action.args[0]), Math.abs(action.args[1]), Math.abs(action.args[4]), Math.abs(action.args[5])  );
        //this.bezierCurveTo(Math.abs(action.args[0]), Math.abs(action.args[1]),Math.abs(action.args[2]), Math.abs(action.args[3]), Math.abs(action.args[4]), Math.abs(action.args[5]) );
        this.bezierCurveTo(action.args[0], action.args[1], action.args[2], action.args[3], action.args[4], action.args[5]  );
      break; 
      case THREE.PathActions.ELLIPSE:
        console.log("uh oh, elipse");
      break;
    }
  }
}

/* Return an array of vectors based on contour of the path */

Shape2d.prototype.getPoints = function( divisions, closedPath ) {
	if (this.useSpacedPoints) {
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
				last = this.actions[ i - 1 ].args2;
        cpx0 = last.x;
        cpy0 = last.y;
			}

			for ( j = 1; j <= divisions; j ++ ) {

				t = j / divisions;

				tx = THREE.Shape.Utils.b2( t, cpx0, cpx1, cpx );
				ty = THREE.Shape.Utils.b2( t, cpy0, cpy1, cpy );

				points.push( new THREE.Vector2( tx, ty ) );

			}

			break;

		case THREE.PathActions.BEZIER_CURVE_TO:
			//cpx  = args[ 4 ];
			//cpy  = args[ 5 ];
			cpx = args2.x;
			cpy = args2.y;

      console.log("generating points from bezier", args2, args3);
      
			//cpx1 = args[ 0 ];
			//cpy1 = args[ 1 ];
			
			cpx1 = args3.x;
			cpy1 = args3.y;

			//cpx2 = args[ 2 ];
			//cpy2 = args[ 3 ];
			var args4 = item.args4;
			cpx2 = args4.x;
			cpy2 = args4.y;
			
			//cpx1 = cpx;
			//cpy1 = cpy;
			

			if ( points.length > 0 ) {
				laste = points[ points.length - 1 ];

				cpx0 = laste.x;
				cpy0 = laste.y;
			} else {

				laste = this.actions[ i - 1 ].args2;

				cpx0 = laste[ laste.length - 2 ]; //laste.x;
				cpy0 = laste[ laste.length - 1 ];//laste.y;
			}
			
			//cpx2 = cpx0;
			//cpy1 = cpy0;

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

      var pos = args2;

			for ( j = 1; j <= tdivisions; j ++ ) {

				t = j / tdivisions;

				if ( ! aClockwise ) {

					t = 1 - t;

				}
				angle = aStartAngle + t * deltaAngle;

				tx = pos.x + xRadius * Math.cos( angle );
				ty = pos.y + yRadius * Math.sin( angle );
				//console.log('t', t, 'angle', angle, 'tx', tx, 'ty', ty);
				points.push( new THREE.Vector2( tx, ty ) );
			}
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
