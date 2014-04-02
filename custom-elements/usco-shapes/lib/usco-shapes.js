(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Shape2d = require("./Shape2d");

function Circle(center, radius)
{
    this.radius = radius || 20;
    this.center = center || new THREE.Vector3();
    Shape2d.apply( this, arguments );
	  this.generate();
	  
    this.properties["radius"] = ["radius", "Radius of the circle", 20]
}
Circle.prototype = Object.create( Shape2d.prototype );
Circle.prototype.constructor = Circle;

Circle.prototype.generate = function()
{
  var center=this.center,radius=this.radius;
  var x = center.x, y = center.y;
  
  //TODO: move this to shape2D
  this.actions = [];
  this.curves = [];
  this.controlPoints = [];
  this.__visualContols = [];
  
	this.moveTo( radius+x, y );
  this.absarc( x, y, radius, 0, Math.PI*2, false );
}

Circle.prototype.attributeChanged=function( attrName, oldValue, newValue )
{
  console.log("Circle's attribute changed", attrName, newValue, oldValue);
  
  this[attrName] = newValue;
  this.properties[attrName][2] = newValue;
  
  this.generate();
  this.updateRenderables();
}

module.exports = Circle;

},{"./Shape2d":3}],2:[function(require,module,exports){

Shape2d = require("./Shape2d");

function Rectangle(width, height, center, radius)
{
    this.width = width || 40;
    this.height = height || 40;
    this.radius = radius || 5;
    this.center = center || new THREE.Vector3();
    
    Shape2d.apply( this, arguments );
    
    this.generate();
		
    this.properties["width"] = ["width", "Width of the rectangle", 40]
    this.properties["height"] = ["height", "height of the rectangle", 40,0.0000001,100,0.1]
    this.properties["radius"] = ["corner radius", "Radius of the rectangle's corners", 5]
	  
}
Rectangle.prototype = Object.create( Shape2d.prototype );
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.generate = function()
{
  var center=this.center,radius=this.radius,width=this.width, height=this.height;
  var x = center.x, y = center.y;
  
  //TODO: move this to shape2D
  this.actions = [];
  this.curves = [];
  this.controlPoints = [];
  this.__visualContols = [];
	  
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

Rectangle.prototype.attributeChanged=function( attrName, oldValue, newValue)
{
  console.log("Rectangle's attribute changed", attrName, newValue, oldValue);
  
  this[attrName] = newValue;
  this.properties[attrName][2] = newValue;
  
  this.generate();
  this.updateRenderables();
}

module.exports = Rectangle;


},{"./Shape2d":3}],3:[function(require,module,exports){

function Shape2d()
{
  this.id = Shape2d.__id++;
  this.name = this.constructor.name;
  
  this.properties = {};
}
Shape2d.__id = 0;


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


Shape2d.prototype.createPointsGeometry = function(divisions)
{
    return THREE.Shape.prototype.createPointsGeometry.call(this, divisions);
}

Shape2d.prototype.generateRenderables = function()
{

}

module.exports = Shape2d;

},{}],4:[function(require,module,exports){
Shape2d = require("./Shape2d");

//TODO: how to deal CLEANLY with multiple shapes in one , like with text?
function Text(options)
{
    var options = options || {};
    var text = this.text = options.text || "foo";//"\uf001";
    var size = this.size = options.size || 20;
    var font = this.font = options.font || "helvetiker";//"fontawesome";
    var weight = this.weight = options.weight || "";
    
    if(font == "fontawesome")
    {
      text = unescape('%u' + text);
    }
    console.log("options", options, font, size, text);
    
    var textShapes = THREE.FontUtils.generateShapes( text, {font:font,size:size} );
    console.log("textShapes", textShapes);
    
    Shape2d.call( this );
    
    for(var i=0;i<textShapes.length;i++)
    {
        this.fromThreeShape( textShapes[i] );
    }

    //console.log("my actions", textShapes[0].actions, this.actions);
    //console.log("my curves", textShapes[0].curves, this.curves);
    
    for(var i=0;i<textShapes[0].holes;i++)
    {
      this.holes.push( textShapes[0].holes[i] );
    }
    //console.log("text", this);
    
    this.properties["text"] = ["text", "Actual text", "foo"]
    this.properties["size"] = ["size", "font size",20]
    this.properties["font"] = ["font", "font type","helvetiker"]
}
Text.prototype = Object.create( Shape2d.prototype );
Text.prototype.constructor = Text;

Text.prototype.attributeChanged=function( attrName, oldValue, newValue)
{
  console.log("text's attribute changed", attrName, newValue, oldValue);
  
  this[attrName] = newValue;
  this.properties[attrName][2] = newValue;
  if(this.font == "fontawesome")
  {
    this.text = unescape('%u' + this.text);
  }
  console.log("text", this.text);

  //TODO: only do this if something changed!
  this.actions = [];
  this.curves = [];
  this.controlPoints = [];
  this.__visualContols = [];
  
  var textShapes = THREE.FontUtils.generateShapes( this.text, {font:this.font,size:this.size} );
  for(var i=0;i<textShapes.length;i++)
  {
      this.fromThreeShape( textShapes[i] );
  }
  this.updateRenderables();
}


Text.prototype.update=function( parameters )
{
  for(var i=0;i< this.renderable.children.length;i++)
  {
    var child = this.renderable.children[i];
    this.renderable.remove( child );
  }
  
  Shape2d.prototype.update.call(this, parameters);
  
  if(this.font == "fontawesome")
  {
    this.text = unescape('%u' + this.text);
  }
  
  //TODO: only do this if something changed!
  this.actions = [];
  this.curves = [];
  this.controlPoints = [];
  this.__visualContols = [];
  
  var textShapes = THREE.FontUtils.generateShapes( this.text, {font:this.font,size:this.size} );
  for(var i=0;i<textShapes.length;i++)
  {
      this.fromThreeShape( textShapes[i] );
  }
  this.generateVisualControlPoints();
  
  Shape2d.prototype.update.call(this, parameters);
}


//FIXME! HAAACK ! not even 2d
/*Text = function ( options ) {

  var options = options || {};
    var text = options.text || "foo";//"\uf001";
    var size = options.size || 20;
    var font = options.font || "helvetiker";//"fontawesome";
    var weight = options.weight || "";
    
    
	textGeo = new THREE.TextGeometry( text, {
          font:font,
					size: size,
					height: 10,
					material: 0,
					extrudeMaterial: 1
				});
	Part.call( this );
	this.geometry = textGeo;
};

Text.prototype = Object.create( Part.prototype );
Text.prototype.constructor = Text;*/

module.exports = Text;


},{"./Shape2d":3}],5:[function(require,module,exports){
//THREE = require("three");
Part = require("./Shape3d");

function Cube(options)
{
  options = options || {};
  this.w = options.w || 20;
  this.h = options.h || 20;
  this.d = options.d || 20;

  Part.call( this );
  this.geometry = new THREE.CubeGeometry( this.w, this.d, this.h );
  //this._bsp = new ThreeBSP(this);
  
  this.properties["w"] = ["width", "Width of the cuboid", 20]//optional min max?
  this.properties["h"] = ["height", "height of the cuboid",20,0.0000001,100,0.1]
  this.properties["d"] = ["depth", "depth of the cuboid",20]
  //TODO: how to provide a preset list of acceptable values (to use with select etc)
  //TODO: add ability to provide range functions, select functions etc (generator functions for the previous
  //params
}
Cube.prototype = Object.create( Part.prototype );
Cube.prototype.constructor = Cube;

Cube.prototype.attributeChanged=function(attrName, oldValue, newValue)
{
  Part.prototype.attributeChanged.call(this, attrName, oldValue, newValue );
  
  console.log("cube's attribute changed", attrName, newValue, oldValue);
  this.geometry = new THREE.CubeGeometry( this.w, this.d, this.h );

  this.updateRenderables();
}

Cube.prototype.update=function( parameters )
{
  Part.prototype.update.call(this, parameters);
  //this.geometry.dispose();
  //delete this.__webglInit;
  //this.geometry = new THREE.CubeGeometry( this.w, this.d, this.h );
}

module.exports = Cube

},{"./Shape3d":7}],6:[function(require,module,exports){
Part = require("./Shape3d");

function Cylinder(options)
{
  options = options || {};
  this.r = options.r || 10;
  this.r2 = options.r2 || 10;
  this.h = options.h || 10;
  this.$fn = options.$fn || shapeDefaultMaxResolution;

  Part.call( this );
  this.geometry = new THREE.CylinderGeometry( this.r2, this.r, this.h ,this.$fn );
  this.geometry.applyMatrix(new THREE.Matrix4().makeRotationX( Math.PI / 2 ));
  
  this.properties["r"] = ["bottom radius", "Radius of the bottom of cylinder", 10]
  this.properties["r2"] =["top radius", "Radius of the top of the cylinder", 10]//optional min max?
  this.properties["h"] =["height", "Height of the cylinder", 10]//optional min max?
  this.properties["$fn"] = ["resolution", "resolution of the cylinder (polygonal)",shapeDefaultMaxResolution]
}
Cylinder.prototype = Object.create( Part.prototype );
Cylinder.prototype.constructor = Cylinder;

Cylinder.prototype.attributeChanged=function(attrName, oldValue, newValue)
{
  Part.prototype.attributeChanged.call(this, attrName, oldValue, newValue );
  
  this.geometry = new THREE.CylinderGeometry( this.r2, this.r, this.h ,this.$fn);
  this.geometry.applyMatrix(new THREE.Matrix4().makeRotationX( Math.PI / 2 ));
  console.log("Cylinder's attribute changed", attrName, newValue, oldValue, this, this.properties, this.geometry);  
  
  this.updateRenderables();
}

module.exports = Cylinder;


},{"./Shape3d":7}],7:[function(require,module,exports){
ThreeBSP = require("./THREECSG");

shapeDefaultMaxResolution = 30;

function Part()
{
  var material = new THREE.MeshPhongMaterial( { color: 0x17a9f5, specular: 0xffffff, shininess: 10,shading: THREE.FlatShading} ); 
  THREE.Mesh.call(this, undefined, material);

  //holds object meta data ("reflexion", links between code and visual etc
  this.__meta = null;
  //this holds all the history of operations for the given shape
  this.operations = [];
  //not so sure, a hash of editable properties: TODO: how to handle this vs simple input params
  this.properties = {};
  //curent implementation uses bsp under the hood...
  this._bsp = null;
  
  
  //this is an abstract element, but it needs a visual representation
  this.renderable = null;
  this.color = new THREE.Color(0x17a9f5);
  //"r" is for "real", for now, do not overrid three.js material property
  this.rMaterial = {color:new THREE.Color(0x17a9f5)};
  
  this.connectors = [];
  
  //just for testing
  var testConnector = new Connector();
  testConnector.up = new THREE.Vector3(0,0,1);
  testConnector.position.z = 10;
  
  var testConnector2 = new Connector();
  testConnector2.up = new THREE.Vector3(0,0,-1);
  testConnector2.position.z = -10;
  
  /*this.add( testConnector );
  this.add( testConnector2 );
  this.connectors.push( testConnector );
  this.connectors.push( testConnector2 );*/
  
  //
  var operation = new Creation(this, this.parent, {});
  this.operations.push( operation );
  
  var event = new CustomEvent('newOperation',{detail: {msg: operation}});
  document.dispatchEvent(event);
}
Part.prototype = Object.create( THREE.Mesh.prototype );
Part.prototype.constructor = Part;

Part.prototype.clone = function()
{
  var newInstance = new this.constructor();
  newInstance.position = this.position.clone();
  newInstance.rotation = this.rotation.clone();
  newInstance.scale    = this.scale.clone();
  newInstance.geometry = this.geometry.clone();
  newInstance.rMaterial.color    = this.rMaterial.color.clone();
  
  for(var propName in this.properties)
  {
    newInstance.properties[propName] = this.properties[propName].slice(0);; 
  }

  console.log("newInstance", newInstance, "current", this);  
  return newInstance;
}

Part.prototype.generateRenderables=function()
{
  var material = new THREE.MeshPhongMaterial( { color: this.rMaterial.color, specular: 0xffffff, shininess: 10,shading: THREE.FlatShading} ); 
  
  this.renderable = new THREE.Mesh(this.geometry, material);
  this.renderable.sourceShape = this;
  
  //this.renderable.position = this.position;
  this.renderable.rotation = this.rotation;
  this.renderable.scale    = this.scale;
  this.renderable.matrix   = this.matrix;
  this.renderable.matrixWorld   = this.matrixWorld;
  this.renderable._rotation = this._rotation ;
	this.renderable._quaternion = this._quaternion;
	
	this.renderable._rotation._quaternion = this.quaternion;
	this.renderable._quaternion._euler = this.rotation;
	
	this.renderable.recieveShadows = true;
	this.renderable.castShadows = true;
	
	
	for(var i=0;i<this.connectors.length;i++)
	{
	    this.renderable.add( this.connectors[i].generateRenderables() );
	}

  for(var i=0;i<this.children.length;i++)
	{
	  var child = this.children[i];
	  child.generateRenderables();
	  this.renderable.add( child.renderable ) ;
	}
	/*this.traverse( function(child){
	  console.log("child", child);
	  child.generateRenderables();
	  if(child.parent) child.parent.renderable.add( child.renderable );
	});*/
  
  return this.renderable;
}

Part.prototype.updateRenderables=function()
{
  if(!(this.renderable))
  {
    this.generateRenderables();
  }
  else
  {
    this.renderable.geometry.dispose();
    delete this.renderable.__webglInit;
    this.renderable.geometry =  this.geometry;
  }
}

Part.prototype.attributeChanged = function(attrName, oldValue, newValue)
{
  this[attrName] = newValue;
  this.properties[attrName][2] = newValue;
  
  
  var operation = new AttributeChange(this, attrName, oldValue,newValue);
  //this.operations.push( operation );
  //this.dispatchEvent({type:'rotated',value:amount}); 
  var event = new CustomEvent('newOperation',{detail: {msg: operation}});
  document.dispatchEvent(event);
}

Part.prototype.update = function( parameters ) 
{
  for (var key in parameters)
  {
    if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key) )
    {
      console.log("updating"+key + " -> " + parameters[key]);
      this[key] = parameters[key];
    }
  }
  
  this.updateRenderables();
}

Part.prototype.fromThreeMesh=function(object){}

Part.prototype.translate=function( amount )
{
  if(amount instanceof Array)
  {
    amount = new THREE.Vector3(amount[0], amount[1], amount[2]);
  }
  var operation = new Translation( amount, this );
  var event = new CustomEvent('newOperation',{detail: {msg: operation}});
  document.dispatchEvent(event);
  
  this.translateX( amount.x );
  this.translateY( amount.y );
  this.translateZ( amount.z );
  
  this.operations.push( operation );
  return operation;
}

Part.prototype.rotate=function( amount )
{
  var operation = new Rotation( amount, this);
  this.operations.push( operation );
  //this.dispatchEvent({type:'rotated',value:amount}); 
  var event = new CustomEvent('newOperation',{detail: {msg: operation}});
  document.dispatchEvent(event);
  
  return operation;
}

//FIXME: THREE.Object3D already has a "scale" property...
Part.prototype.Scale=function( amount )
{
  var operation = new Scaling( amount, this);
  this.operations.push( operation );
  var event = new CustomEvent('newOperation',{detail: {msg: operation}});
  document.dispatchEvent(event);
  return operation;
}

Part.prototype.union=function(objects)
{
  /*this._bsp = new ThreeBSP(this);
  for(var i=0;i<objects.length;i++)
  {
    var object = objects[i];
    object._bsp = new ThreeBSP(object);
    this._bsp = new ThreeBSP( this ) ;
    this._bsp = this._bsp.union( object._bsp );
    //TODO : only generate geometry on final pass ie make use of csg tree or processing tree/ast
    delete this.__webglInit;
    this.geometry.dispose();
    this.geometry = this._bsp.toGeometry();
    this.geometry.computeVertexNormals()
    this.geometry.computeBoundingBox()
    this.geometry.computeCentroids()
    this.geometry.computeFaceNormals();
    this.geometry.computeBoundingSphere();
  }*/
  var newPart = new Part();
  newPart.position = this.position.clone();
  newPart.scale    = this.scale.clone();
  newPart.rotation = this.rotation.clone();
  newPart.geometry = this.geometry.clone();
  
  newPart._bsp = new ThreeBSP(newPart);
  var oldGeometry = this.geometry.clone();
  
  for(var i=0;i<objects.length;i++)
  {
    var object = objects[i];
    // TODO: find a way to do this without regenerating the bsp   
     object._bsp = new ThreeBSP(object);
     newPart._bsp = new ThreeBSP( newPart ) ;
     newPart._bsp = newPart._bsp.union( object._bsp );
     //TODO : only generate geometry on final pass ie make use of csg tree or processing tree/ast
     newPart.geometry.dispose();
     newPart.geometry = newPart._bsp.toGeometry();
     newPart.geometry.computeVertexNormals()
     newPart.geometry.computeBoundingBox()
     newPart.geometry.computeCentroids()
     newPart.geometry.computeFaceNormals();
     newPart.geometry.computeBoundingSphere();
  }  
  newPart.updateRenderables(); 
  
  var operands = objects;
  var operation = new Union( this, operands, newPart );
  newPart.operations.push ( operation );
  
  var event = new CustomEvent('newOperation',{detail: {msg: operation}});
  document.dispatchEvent(event);
  
  //remove operands from hierarchy & their renderables from view
  this.parent.remove(this);
  this.renderable.parent.remove( this.renderable );
  
  for(var i = 0; i < operands.length;i++)
  {
      var op = operands[i];
      var rOp = op.renderable;
      op.parent.remove( op );
      rOp.parent.remove( rOp );
  }
  
  return newPart;
}

Part.prototype.subtract=function(objects)
{
  /*current instance modification variant
  this._bsp = new ThreeBSP(this);
  var oldGeometry = this.geometry.clone();
  
  for(var i=0;i<objects.length;i++)
  {
    var object = objects[i];
    // TODO: find a way to do this without regenerating the bsp   
     object._bsp = new ThreeBSP(object);
     this._bsp = new ThreeBSP( this ) ;
     this._bsp = this._bsp.subtract( object._bsp );
     //TODO : only generate geometry on final pass ie make use of csg tree or processing tree/ast
     delete this.__webglInit;
     this.geometry.dispose();
     this.geometry = this._bsp.toGeometry();
     console.log("bsp", this.geometry);
     this.geometry.computeVertexNormals()
     this.geometry.computeBoundingBox()
     this.geometry.computeCentroids()
     this.geometry.computeFaceNormals();
     this.geometry.computeBoundingSphere();
  }  
  
  delete this.renderable.__webglInit;
  this.renderable.geometry = this.geometry;
  
  var operands = objects;
  var operation = new Subtraction(this, oldGeometry, operands ) ;
  this.operations.push ( operation );
  
  var event = new CustomEvent('newOperation',{detail: {msg: operation}});
  document.dispatchEvent(event);
  
  return this;*/
  var newPart = new Part();
  newPart.position = this.position.clone();
  newPart.scale    = this.scale.clone();
  newPart.rotation = this.rotation.clone();
  newPart.geometry = this.geometry.clone();

  
  newPart._bsp = new ThreeBSP(newPart);
  var oldGeometry = this.geometry.clone();
  
  for(var i=0;i<objects.length;i++)
  {
    var object = objects[i];
    // TODO: find a way to do this without regenerating the bsp   
     object._bsp = new ThreeBSP(object);
     newPart._bsp = new ThreeBSP( newPart ) ;
     newPart._bsp = newPart._bsp.subtract( object._bsp );
     //TODO : only generate geometry on final pass ie make use of csg tree or processing tree/ast
     newPart.geometry.dispose();
     newPart.geometry = newPart._bsp.toGeometry();
     newPart.geometry.computeVertexNormals()
     newPart.geometry.computeBoundingBox()
     newPart.geometry.computeCentroids()
     newPart.geometry.computeFaceNormals();
     newPart.geometry.computeBoundingSphere();
  }  
  newPart.updateRenderables(); 
  
  var operands = objects;
  var operation = new Subtraction2(this, operands, newPart)
  newPart.operations.push ( operation );
  
  //remove operands from view
  if(this.parent) this.parent.remove( this );
  if(this.renderable) this.renderable.parent.remove( this.renderable );
  for(var i = 0; i < operands.length;i++)
  {
      var op = operands[i];
      if(op.parent) op.parent.remove( op );
      if(op.renderable)
      {
        op.renderable.parent.remove( op.renderable );
      }
  }
  
  var event = new CustomEvent('newOperation',{detail: {msg: operation}});
  document.dispatchEvent(event);
  
  return newPart;
}

Part.prototype.intersect=function(objects)
{
  /*this._bsp = new ThreeBSP(this);
  for(var i=0;i<objects.length;i++)
  {
    var object = objects[i];
    object._bsp = new ThreeBSP(object);
    this._bsp = new ThreeBSP( this ) ;
    this._bsp = this._bsp.intersect( object._bsp );
    //TODO : only generate geometry on final pass ie make use of csg tree or processing tree/ast
    delete this.__webglInit;
    this.geometry.dispose();
    this.geometry = this._bsp.toGeometry();
    this.geometry.computeVertexNormals()
    this.geometry.computeBoundingBox()
    this.geometry.computeCentroids()
    this.geometry.computeFaceNormals();
    this.geometry.computeBoundingSphere();
  }*/
  
  var newPart = new Part();
  newPart.position = this.position.clone();
  newPart.scale    = this.scale.clone();
  newPart.rotation = this.rotation.clone();
  newPart.geometry = this.geometry.clone();
  
  newPart._bsp = new ThreeBSP(newPart);
  var oldGeometry = this.geometry.clone();
  
  for(var i=0;i<objects.length;i++)
  {
    var object = objects[i];
    // TODO: find a way to do this without regenerating the bsp   
     object._bsp = new ThreeBSP(object);
     newPart._bsp = new ThreeBSP( newPart ) ;
     newPart._bsp = newPart._bsp.intersect( object._bsp );
     //TODO : only generate geometry on final pass ie make use of csg tree or processing tree/ast
     newPart.geometry.dispose();
     newPart.geometry = newPart._bsp.toGeometry();
     newPart.geometry.computeVertexNormals()
     newPart.geometry.computeBoundingBox()
     newPart.geometry.computeCentroids()
     newPart.geometry.computeFaceNormals();
     newPart.geometry.computeBoundingSphere();
  }  
  newPart.updateRenderables(); 
  
  var operands = objects;
  var operation = new Intersection( this, operands, newPart );
  newPart.operations.push ( operation );
  
  var event = new CustomEvent('newOperation',{detail: {msg: operation}});
  document.dispatchEvent(event);
  
  //remove operands from view
  this.renderable.parent.remove( this.renderable );
  for(var i = 0; i < operands.length;i++)
  {
      var op = operands[i].renderable;
      op.parent.remove( op );
  }
  
  return newPart;
}



module.exports = Part

},{"./THREECSG":9}],8:[function(require,module,exports){
Part = require("./Shape3d");

function Sphere(options)
{
  options = options || {};
  this.r = options.r || 10;
  this.$fn = options.$fn || shapeDefaultMaxResolution;

  Part.call( this );
  this.geometry = new THREE.SphereGeometry( this.r, this.$fn, this.$fn );
  
  this.properties["r"] = ["radius", "Radius of the sphere", 10]//optional min max?
  this.properties["$fn"] = ["resolution", "resolution of the sphere",shapeDefaultMaxResolution]
}
Sphere.prototype = Object.create( Part.prototype );
Sphere.prototype.constructor = Sphere;


Sphere.prototype.attributeChanged=function(attrName, oldValue, newValue)
{
  Part.prototype.attributeChanged.call(this, attrName, oldValue, newValue );

  console.log("sphere's attribute changed", attrName, newValue, oldValue);
  this.geometry = new THREE.SphereGeometry( this.r, this.$fn, this.$fn );
  
  this.updateRenderables();
}

module.exports = Sphere;

},{"./Shape3d":7}],9:[function(require,module,exports){
'use strict';
	var ThreeBSP,
		EPSILON = 1e-5,
		COPLANAR = 0,
		FRONT = 1,
		BACK = 2,
		SPANNING = 3;
	
	ThreeBSP = function( geometry ) {
		// Convert THREE.Geometry to ThreeBSP
		var i, _length_i,
			face, vertex, faceVertexUvs,
			polygon,
			polygons = [],
			tree;
	
		if ( geometry instanceof THREE.Geometry ) {
			this.matrix = new THREE.Matrix4;
		} else if ( geometry instanceof THREE.Mesh ) {
			// #todo: add hierarchy support
			geometry.updateMatrix();
			this.matrix = geometry.matrix.clone();
			geometry = geometry.geometry;
		} else if ( geometry instanceof ThreeBSP.Node ) {
			this.tree = geometry;
			this.matrix = new THREE.Matrix4;
			return this;
		} else {
			throw 'ThreeBSP: Given geometry is unsupported';
		}
	
		for ( i = 0, _length_i = geometry.faces.length; i < _length_i; i++ ) {
			face = geometry.faces[i];
			faceVertexUvs = geometry.faceVertexUvs[0][i];
			polygon = new ThreeBSP.Polygon;
			
			if ( face instanceof THREE.Face3 ) {
				vertex = geometry.vertices[ face.a ];
				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[0], new THREE.Vector2( faceVertexUvs[0].x, faceVertexUvs[0].y ) );
				vertex.applyMatrix4(this.matrix);
				polygon.vertices.push( vertex );
				
				vertex = geometry.vertices[ face.b ];
				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[1], new THREE.Vector2( faceVertexUvs[1].x, faceVertexUvs[1].y ) );
				vertex.applyMatrix4(this.matrix);
				polygon.vertices.push( vertex );
				
				vertex = geometry.vertices[ face.c ];
				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[2], new THREE.Vector2( faceVertexUvs[2].x, faceVertexUvs[2].y ) );
				vertex.applyMatrix4(this.matrix);
				polygon.vertices.push( vertex );
			} else if ( typeof THREE.Face4 ) {
				vertex = geometry.vertices[ face.a ];
				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[0], new THREE.Vector2( faceVertexUvs[0].x, faceVertexUvs[0].y ) );
				vertex.applyMatrix4(this.matrix);
				polygon.vertices.push( vertex );
				
				vertex = geometry.vertices[ face.b ];
				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[1], new THREE.Vector2( faceVertexUvs[1].x, faceVertexUvs[1].y ) );
				vertex.applyMatrix4(this.matrix);
				polygon.vertices.push( vertex );
				
				vertex = geometry.vertices[ face.c ];
				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[2], new THREE.Vector2( faceVertexUvs[2].x, faceVertexUvs[2].y ) );
				vertex.applyMatrix4(this.matrix);
				polygon.vertices.push( vertex );
				
				vertex = geometry.vertices[ face.d ];
				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[3], new THREE.Vector2( faceVertexUvs[3].x, faceVertexUvs[3].y ) );
				vertex.applyMatrix4(this.matrix);
				polygon.vertices.push( vertex );
			} else {
				throw 'Invalid face type at index ' + i;
			}
			
			polygon.calculateProperties();
			polygons.push( polygon );
		};
	
		this.tree = new ThreeBSP.Node( polygons );
	};
	ThreeBSP.prototype.subtract = function( other_tree ) {
		var a = this.tree.clone(),
			b = other_tree.tree.clone();
		
		a.invert();
		a.clipTo( b );
		b.clipTo( a );
		b.invert();
		b.clipTo( a );
		b.invert();
		a.build( b.allPolygons() );
		a.invert();
		a = new ThreeBSP( a );
		a.matrix = this.matrix;
		return a;
	};
	ThreeBSP.prototype.union = function( other_tree ) {
		var a = this.tree.clone(),
			b = other_tree.tree.clone();
		
		a.clipTo( b );
		b.clipTo( a );
		b.invert();
		b.clipTo( a );
		b.invert();
		a.build( b.allPolygons() );
		a = new ThreeBSP( a );
		a.matrix = this.matrix;
		return a;
	};
	ThreeBSP.prototype.intersect = function( other_tree ) {
		var a = this.tree.clone(),
			b = other_tree.tree.clone();
		
		a.invert();
		b.clipTo( a );
		b.invert();
		a.clipTo( b );
		b.clipTo( a );
		a.build( b.allPolygons() );
		a.invert();
		a = new ThreeBSP( a );
		a.matrix = this.matrix;
		return a;
	};
	ThreeBSP.prototype.toGeometry = function() {
		var i, j,
			matrix = new THREE.Matrix4().getInverse( this.matrix ),
			geometry = new THREE.Geometry(),
			polygons = this.tree.allPolygons(),
			polygon_count = polygons.length,
			polygon, polygon_vertice_count,
			vertice_dict = {},
			vertex_idx_a, vertex_idx_b, vertex_idx_c,
			vertex, face,
			verticeUvs;
	
		for ( i = 0; i < polygon_count; i++ ) {
			polygon = polygons[i];
			polygon_vertice_count = polygon.vertices.length;
			
			for ( j = 2; j < polygon_vertice_count; j++ ) {
				verticeUvs = [];
				
				vertex = polygon.vertices[0];
				verticeUvs.push( new THREE.Vector2( vertex.uv.x, vertex.uv.y ) );
				vertex = new THREE.Vector3( vertex.x, vertex.y, vertex.z );
				vertex.applyMatrix4(matrix);
				
				if ( typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined' ) {
					vertex_idx_a = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];
				} else {
					geometry.vertices.push( vertex );
					vertex_idx_a = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1;
				}
				
				vertex = polygon.vertices[j-1];
				verticeUvs.push( new THREE.Vector2( vertex.uv.x, vertex.uv.y ) );
				vertex = new THREE.Vector3( vertex.x, vertex.y, vertex.z );
				vertex.applyMatrix4(matrix);
				if ( typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined' ) {
					vertex_idx_b = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];
				} else {
					geometry.vertices.push( vertex );
					vertex_idx_b = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1;
				}
				
				vertex = polygon.vertices[j];
				verticeUvs.push( new THREE.Vector2( vertex.uv.x, vertex.uv.y ) );
				vertex = new THREE.Vector3( vertex.x, vertex.y, vertex.z );
				vertex.applyMatrix4(matrix);
				if ( typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined' ) {
					vertex_idx_c = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];
				} else {
					geometry.vertices.push( vertex );
					vertex_idx_c = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1;
				}
				
				face = new THREE.Face3(
					vertex_idx_a,
					vertex_idx_b,
					vertex_idx_c,
					new THREE.Vector3( polygon.normal.x, polygon.normal.y, polygon.normal.z )
				);
				
				geometry.faces.push( face );
				geometry.faceVertexUvs[0].push( verticeUvs );
			}
			
		}
		return geometry;
	};
	ThreeBSP.prototype.toMesh = function( material ) {
		var geometry = this.toGeometry(),
			mesh = new THREE.Mesh( geometry, material );
		
		mesh.position.getPositionFromMatrix( this.matrix );
		mesh.rotation.setFromRotationMatrix( this.matrix );
		
		return mesh;
	};
	
	
	ThreeBSP.Polygon = function( vertices, normal, w ) {
		if ( !( vertices instanceof Array ) ) {
			vertices = [];
		}
		
		this.vertices = vertices;
		if ( vertices.length > 0 ) {
			this.calculateProperties();
		} else {
			this.normal = this.w = undefined;
		}
	};
	ThreeBSP.Polygon.prototype.calculateProperties = function() {
		var a = this.vertices[0],
			b = this.vertices[1],
			c = this.vertices[2];
			
		this.normal = b.clone().subtract( a ).cross(
			c.clone().subtract( a )
		).normalize();
		
		this.w = this.normal.clone().dot( a );
		
		return this;
	};
	ThreeBSP.Polygon.prototype.clone = function() {
		var i, vertice_count,
			polygon = new ThreeBSP.Polygon;
		
		for ( i = 0, vertice_count = this.vertices.length; i < vertice_count; i++ ) {
			polygon.vertices.push( this.vertices[i].clone() );
		};
		polygon.calculateProperties();
		
		return polygon;
	};
	
	ThreeBSP.Polygon.prototype.flip = function() {
		var i, vertices = [];
		
		this.normal.multiplyScalar( -1 );
		this.w *= -1;
		
		for ( i = this.vertices.length - 1; i >= 0; i-- ) {
			vertices.push( this.vertices[i] );
		};
		this.vertices = vertices;
		
		return this;
	};
	ThreeBSP.Polygon.prototype.classifyVertex = function( vertex ) {  
		var side_value = this.normal.dot( vertex ) - this.w;
		
		if ( side_value < -EPSILON ) {
			return BACK;
		} else if ( side_value > EPSILON ) {
			return FRONT;
		} else {
			return COPLANAR;
		}
	};
	ThreeBSP.Polygon.prototype.classifySide = function( polygon ) {
		var i, vertex, classification,
			num_positive = 0,
			num_negative = 0,
			vertice_count = polygon.vertices.length;
		
		for ( i = 0; i < vertice_count; i++ ) {
			vertex = polygon.vertices[i];
			classification = this.classifyVertex( vertex );
			if ( classification === FRONT ) {
				num_positive++;
			} else if ( classification === BACK ) {
				num_negative++;
			}
		}
		
		if ( num_positive > 0 && num_negative === 0 ) {
			return FRONT;
		} else if ( num_positive === 0 && num_negative > 0 ) {
			return BACK;
		} else if ( num_positive === 0 && num_negative === 0 ) {
			return COPLANAR;
		} else {
			return SPANNING;
		}
	};
	ThreeBSP.Polygon.prototype.splitPolygon = function( polygon, coplanar_front, coplanar_back, front, back ) {
		var classification = this.classifySide( polygon );
		
		if ( classification === COPLANAR ) {
			
			( this.normal.dot( polygon.normal ) > 0 ? coplanar_front : coplanar_back ).push( polygon );
			
		} else if ( classification === FRONT ) {
			
			front.push( polygon );
			
		} else if ( classification === BACK ) {
			
			back.push( polygon );
			
		} else {
			
			var vertice_count,
				i, j, ti, tj, vi, vj,
				t, v,
				f = [],
				b = [];
			
			for ( i = 0, vertice_count = polygon.vertices.length; i < vertice_count; i++ ) {
				
				j = (i + 1) % vertice_count;
				vi = polygon.vertices[i];
				vj = polygon.vertices[j];
				ti = this.classifyVertex( vi );
				tj = this.classifyVertex( vj );
				
				if ( ti != BACK ) f.push( vi );
				if ( ti != FRONT ) b.push( vi );
				if ( (ti | tj) === SPANNING ) {
					t = ( this.w - this.normal.dot( vi ) ) / this.normal.dot( vj.clone().subtract( vi ) );
					v = vi.interpolate( vj, t );
					f.push( v );
					b.push( v );
				}
			}
			
			
			if ( f.length >= 3 ) front.push( new ThreeBSP.Polygon( f ).calculateProperties() );
			if ( b.length >= 3 ) back.push( new ThreeBSP.Polygon( b ).calculateProperties() );
		}
	};
	
	ThreeBSP.Vertex = function( x, y, z, normal, uv ) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.normal = normal || new THREE.Vector3;
		this.uv = uv || new THREE.Vector2;
	};
	ThreeBSP.Vertex.prototype.clone = function() {
		return new ThreeBSP.Vertex( this.x, this.y, this.z, this.normal.clone(), this.uv.clone() );
	};
	ThreeBSP.Vertex.prototype.add = function( vertex ) {
		this.x += vertex.x;
		this.y += vertex.y;
		this.z += vertex.z;
		return this;
	};
	ThreeBSP.Vertex.prototype.subtract = function( vertex ) {
		this.x -= vertex.x;
		this.y -= vertex.y;
		this.z -= vertex.z;
		return this;
	};
	ThreeBSP.Vertex.prototype.multiplyScalar = function( scalar ) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	};
	ThreeBSP.Vertex.prototype.cross = function( vertex ) {
		var x = this.x,
			y = this.y,
			z = this.z;

		this.x = y * vertex.z - z * vertex.y;
		this.y = z * vertex.x - x * vertex.z;
		this.z = x * vertex.y - y * vertex.x;
		
		return this;
	};
	ThreeBSP.Vertex.prototype.normalize = function() {
		var length = Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );
		
		this.x /= length;
		this.y /= length;
		this.z /= length;
		
		return this;
	};
	ThreeBSP.Vertex.prototype.dot = function( vertex ) {
		return this.x * vertex.x + this.y * vertex.y + this.z * vertex.z;
	};
	ThreeBSP.Vertex.prototype.lerp = function( a, t ) {
		this.add(
			a.clone().subtract( this ).multiplyScalar( t )
		);
		
		this.normal.add(
			a.normal.clone().sub( this.normal ).multiplyScalar( t )
		);
		
		this.uv.add(
			a.uv.clone().sub( this.uv ).multiplyScalar( t )
		);
		
		return this;
	};
	ThreeBSP.Vertex.prototype.interpolate = function( other, t ) {
		return this.clone().lerp( other, t );
	};
	ThreeBSP.Vertex.prototype.applyMatrix4 = function ( m ) {

		// input: THREE.Matrix4 affine matrix

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;

		this.x = e[0] * x + e[4] * y + e[8]  * z + e[12];
		this.y = e[1] * x + e[5] * y + e[9]  * z + e[13];
		this.z = e[2] * x + e[6] * y + e[10] * z + e[14];

		return this;

	}
	
	
	ThreeBSP.Node = function( polygons ) {
		var i, polygon_count,
			front = [],
			back = [];

		this.polygons = [];
		this.front = this.back = undefined;
		
		if ( !(polygons instanceof Array) || polygons.length === 0 ) return;

		this.divider = polygons[0].clone();
		
		for ( i = 0, polygon_count = polygons.length; i < polygon_count; i++ ) {
			this.divider.splitPolygon( polygons[i], this.polygons, this.polygons, front, back );
		}   
		
		if ( front.length > 0 ) {
			this.front = new ThreeBSP.Node( front );
		}
		
		if ( back.length > 0 ) {
			this.back = new ThreeBSP.Node( back );
		}
	};
	ThreeBSP.Node.isConvex = function( polygons ) {
		var i, j;
		for ( i = 0; i < polygons.length; i++ ) {
			for ( j = 0; j < polygons.length; j++ ) {
				if ( i !== j && polygons[i].classifySide( polygons[j] ) !== BACK ) {
					return false;
				}
			}
		}
		return true;
	};
	ThreeBSP.Node.prototype.build = function( polygons ) {
		var i, polygon_count,
			front = [],
			back = [];
		
		if ( !this.divider ) {
			this.divider = polygons[0].clone();
		}

		for ( i = 0, polygon_count = polygons.length; i < polygon_count; i++ ) {
			this.divider.splitPolygon( polygons[i], this.polygons, this.polygons, front, back );
		}   
		
		if ( front.length > 0 ) {
			if ( !this.front ) this.front = new ThreeBSP.Node();
			this.front.build( front );
		}
		
		if ( back.length > 0 ) {
			if ( !this.back ) this.back = new ThreeBSP.Node();
			this.back.build( back );
		}
	};
	ThreeBSP.Node.prototype.allPolygons = function() {
		var polygons = this.polygons.slice();
		if ( this.front ) polygons = polygons.concat( this.front.allPolygons() );
		if ( this.back ) polygons = polygons.concat( this.back.allPolygons() );
		return polygons;
	};
	ThreeBSP.Node.prototype.clone = function() {
		var node = new ThreeBSP.Node();
		
		node.divider = this.divider.clone();
		node.polygons = this.polygons.map( function( polygon ) { return polygon.clone(); } );
		node.front = this.front && this.front.clone();
		node.back = this.back && this.back.clone();
		
		return node;
	};
	ThreeBSP.Node.prototype.invert = function() {
		var i, polygon_count, temp;
		
		for ( i = 0, polygon_count = this.polygons.length; i < polygon_count; i++ ) {
			this.polygons[i].flip();
		}
		
		this.divider.flip();
		if ( this.front ) this.front.invert();
		if ( this.back ) this.back.invert();
		
		temp = this.front;
		this.front = this.back;
		this.back = temp;
		
		return this;
	};
	ThreeBSP.Node.prototype.clipPolygons = function( polygons ) {
		var i, polygon_count,
			front, back;

		if ( !this.divider ) return polygons.slice();
		
		front = [], back = [];
		
		for ( i = 0, polygon_count = polygons.length; i < polygon_count; i++ ) {
			this.divider.splitPolygon( polygons[i], front, back, front, back );
		}

		if ( this.front ) front = this.front.clipPolygons( front );
		if ( this.back ) back = this.back.clipPolygons( back );
		else back = [];

		return front.concat( back );
	};
	
	ThreeBSP.Node.prototype.clipTo = function( node ) {
		this.polygons = node.clipPolygons( this.polygons );
		if ( this.front ) this.front.clipTo( node );
		if ( this.back ) this.back.clipTo( node );
	};
	
	module.exports= ThreeBSP;

},{}],10:[function(require,module,exports){
Part = require("./Shape3d");

function Torus(options)
{
  options = options || {};
  this.r = options.r || 10;
  this.tube = options.tube || 4;
  this.$fn = options.$fn || 20;

  Part.call( this );
  //var geometry = new THREE.TorusKnotGeometry( 20, 6, 200, 100, 1, 3 );
  this.geometry = new THREE.TorusGeometry( this.r,this.tube, this.$fn, this.$fn );
  //radius, tube, segmentsR, segmentsT, arc
  
  this.properties["r"] = ["radius", "Radius of torus", 10]
  this.properties["tube"] =["tube","bla", 4]
  this.properties["$fn"] = ["resolution", "resolution of the torus (polygonal)",20]
}
Torus.prototype = Object.create( Part.prototype );
Torus.prototype.constructor = Torus;

Torus.prototype.attributeChanged=function(attrName, oldValue, newValue)
{
  Part.prototype.attributeChanged.call(this, attrName, oldValue, newValue );  
  console.log("Torus's attribute changed", attrName, newValue, oldValue, this, this.properties);
  this.geometry = new THREE.TorusGeometry( this.r,this.tube, this.$fn, this.$fn );

  this.updateRenderables();
}

module.exports = Torus;
              

},{"./Shape3d":7}],11:[function(require,module,exports){
//THREE = require("three");

Operations = require("./operations/operations");

Part = require("./3d/Shape3d");
Cube = require("./3d/Cube");
Sphere = require("./3d/Sphere");
Cylinder = require("./3d/Cylinder");
Torus = require("./3d/Torus");

Shape2d = require("./2d/Shape2d");
Rectangle = require("./2d/Rectangle");
Circle = require("./2d/Circle");
Text = require("./2d/Text");

},{"./2d/Circle":1,"./2d/Rectangle":2,"./2d/Shape2d":3,"./2d/Text":4,"./3d/Cube":5,"./3d/Cylinder":6,"./3d/Shape3d":7,"./3d/Sphere":8,"./3d/Torus":10,"./operations/operations":21}],12:[function(require,module,exports){
Command = require('./command');

AttributeChange = function (target, attrName, oldValue, newValue)
{
  Command.call( this );
  this.type = "attributeChange";
  this.target = target;
  this.attrName = attrName;
  this.value = newValue;
  this.oldValue = oldValue;
  
  console.log("new attribute change operation", target, attrName, newValue, oldValue);
}
AttributeChange.prototype = Object.create( Command.prototype );
AttributeChange.prototype.constructor=AttributeChange;
AttributeChange.prototype.clone = function()
{
  return new AttributeChange( this.target, this.attrName, this.oldValue, this.value );
}

AttributeChange.prototype.undo = function()
{
  console.log("undo attrib change", this.value, this.oldValue, this.attrName);
  this.target.properties[this.attrName][2] = this.oldValue;//update( this.oldAttributes );
  this.target[this.attrName] = this.oldValue;
  
  //this.target.updateRenderables();
  //this.target.attributeChanged(this.attrName,this.oldValue, this.value ); 
}

AttributeChange.prototype.redo = function()
{
  this.target.properties[this.attrName][2] = this.value;//update( this.newAttributes );
  this.target[this.attrName] = this.value;
}

module.exports = AttributeChange;

},{"./command":14}],13:[function(require,module,exports){
Command = require('./command');

Clone = function ( source, target )
{
  Command.call( this );
  this.type = "clone";
  this.source = source;
  this.target = target;
  //this.value = value;
}
Clone.prototype = Object.create( Command.prototype );
Clone.prototype.constructor=Clone;
Clone.prototype.clone = function()
{
  return new Clone( this.source, this.target);
}

Clone.prototype.undo = function()
{
  this._oldParent = this.target.parent;
  this.target.parent.remove(this.target);
  
  //hack
  this.target.renderable.visible = false;
}

Clone.prototype.redo = function()
{
  this._oldParent.add(this.target);
  
  //hack
  this.target.renderable.visible = true;
}

module.exports = Clone;

},{"./command":14}],14:[function(require,module,exports){
//operation "class"
Command = function ( type, value, target)
{
  this.type = type;
  this.value = value;
  this.target = target;
}
Command.prototype.clone = function()
{
  throw new Error("not implemented");
}

module.exports = Command;

},{}],15:[function(require,module,exports){
Command = require('./command');

Creation = function (target, parentObject, options)
{
  Command.call( this );
  this.type = "creation";
  this.target = target;
  this.parentObject = parentObject;
  this.value = options;
}
Creation.prototype = Object.create( Command.prototype );
Creation.prototype.constructor=Creation;
Creation.prototype.clone = function()
{
  return new Creation( this.target, this.parentObject, this.value);
}

Creation.prototype.undo = function()
{
  this._oldParent = this.target.parent;
  this.target.parent.remove(this.target);
  
  //semi hack
  if(this.target.renderable)
  {
    this.target.renderable._oldParent = this.target.renderable.parent;
    this.target.renderable.parent.remove(this.target.renderable);
  }
}

Creation.prototype.redo = function()
{
  this._oldParent.add(this.target);
  
  //semi-hack
  if(this.target.renderable)
  {
    this.target.renderable._oldParent.add( this.target.renderable );
  }
}

module.exports = Creation;

},{"./command":14}],16:[function(require,module,exports){
Command = require('./command');

Deletion = function (target, parentObject)
{
  Command.call( this );
  this.type = "deletion";
  this.target = target;
  this.parentObject = parentObject;
}
Deletion.prototype = Object.create( Command.prototype );
Deletion.prototype.constructor=Deletion;
Deletion.prototype.clone = function()
{
  return new Creation( this.target, this.parentObject);
}

Deletion.prototype.undo = function()
{
    this.parentObject.add(this.target);
}

Deletion.prototype.redo = function()
{
  this.parentObject.remove(this.target);
}

module.exports = Deletion;

},{"./command":14}],17:[function(require,module,exports){
Command = require('./command');

Extrusion = function (target, value, sourceShape, parentObject)
{
  Command.call( this );
  this.type = "extrusion";
  this.target = target;
  this.value = value;
  this.sourceShape = sourceShape;
  this.parentObject = parentObject;
}
Extrusion.prototype = Object.create( Command.prototype );
Extrusion.prototype.constructor=Extrusion;
Extrusion.prototype.clone = function()
{
  return new Extrusion( this.target, this.value, this.sourceShape, this.parentObject);
}

Extrusion.prototype.undo = function()
{
    this.parentObject.remove(this.target);
}

Extrusion.prototype.redo = function()
{
  this.parentObject.add(this.target);
}

module.exports = Extrusion;

},{"./command":14}],18:[function(require,module,exports){
Command = require('./command');

Import = function ( value, target)
{
  Command.call( this );
  this.type = "import";
  this.value = value;
  this.target = target;
}
Import.prototype = Object.create( Command.prototype );
Import.prototype.constructor=Import;
Import.prototype.clone = function()
{
  return new Import( this.value, this.target);
}
/*Not sure about this
Import.prototype.execute = function(value)
{
    this.target.position.add(value);
}*/

Import.prototype.undo = function()
{
  this._oldParent = this.value.parent;
  this.value.parent.remove(this.value);
  //hack
  this.value.renderable.visible = false;
}

Import.prototype.redo = function()
{
  this._oldParent.add(this.value);
  //hack
  this.value.renderable.visible = true;
}

module.exports = Import;

},{"./command":14}],19:[function(require,module,exports){
Command = require('./command');

//FIXME: HAAACK !
Intersection = function ( leftOperand, rightOperands, result )
{
  Command.call( this );
  this.type = "intersection";
  this.target = leftOperand;
  this.result = result ;
  this.operands = rightOperands || [];
}
Intersection.prototype = Object.create( Command.prototype );
Intersection.prototype.constructor=Intersection;
Intersection.prototype.clone = function()
{
  return new Intersection( this.target, this.operands, this.result );
}

Intersection.prototype.undo = function()
{
  var resRenderable = this.result.renderable;
  var resRenderableParent = resRenderable.parent;
  resRenderableParent.remove( resRenderable ) ;
  
  //re-add operands to view
  var leftOpRenderable = this.target.renderable;
  resRenderableParent.add( leftOpRenderable );
  
  var operands = this.operands;
  for(var i = 0; i < operands.length;i++)
  {
      var op = operands[i].renderable;
      resRenderableParent.add( op );
  }
}

Intersection.prototype.redo = function()
{
  var leftOpRenderable = this.target.renderable;
  var leftOpRenderableParent = leftOpRenderable.parent;
  leftOpRenderableParent.remove( leftOpRenderable);
  
  leftOpRenderableParent.add(this.result.renderable);
  
  var operands = this.operands;
  for(var i = 0; i < operands.length;i++)
  {
      var op = operands[i].renderable;
      op.parent.remove( op );
  } 
  //target.dispatchEvent( { type: 'shapeChanged' } );
}

module.exports = Intersection;

},{"./command":14}],20:[function(require,module,exports){
Command = require('./command');

Mirror = function ( target, axis)
{
  Command.call( this );
  this.type = "mirroring";
  this.target = target;
  this.value = axis
}
Mirror.prototype = Object.create( Command.prototype );
Mirror.prototype.constructor=Translation;
Mirror.prototype.clone = function()
{
  return new Mirror( this.target, this.value);
}

Mirror.prototype.undo = function()
{
    this.target.mirror(this.value);
}

Mirror.prototype.redo = function()
{
    this.target.mirror(this.value);
}

module.exports = Mirror;

},{"./command":14}],21:[function(require,module,exports){

Command = require('./command');

Creation = require('./creation');
Deletion = require('./deletion');
Clone = require('./clone');
Import = require('./import');
AttributeChange = require('./attributeChange');

Translation = require('./translation');
Rotation = require('./rotation');
Scaling = require('./scaling');

Mirror = require('./mirror');
Extrusion = require('./extrusion');

Union = require('./union');
Subtraction = require('./subtraction2');
Intersection = require('./intersection');





},{"./attributeChange":12,"./clone":13,"./command":14,"./creation":15,"./deletion":16,"./extrusion":17,"./import":18,"./intersection":19,"./mirror":20,"./rotation":22,"./scaling":23,"./subtraction2":24,"./translation":25,"./union":26}],22:[function(require,module,exports){
Command = require('./command');

Rotation = function ( value, target)
{
  Command.call( this );
  this.type = "rotation";
  this.value = value;
  this.target = target;
}
Rotation.prototype = Object.create( Command.prototype );
Rotation.prototype.constructor=Rotation;
Rotation.prototype.clone = function()
{
  return new Rotation( this.value.clone(), this.target);
}

Rotation.prototype.undo = function()
{
    //this.target.position.sub(this.value);
    this.target.rotation.x -= this.value.x;
    this.target.rotation.y -= this.value.y;
    this.target.rotation.z -= this.value.z;
}

Rotation.prototype.redo = function()
{
    this.target.rotation.x += this.value.x;
    this.target.rotation.y += this.value.y;
    this.target.rotation.z += this.value.z;
}

module.exports = Rotation;

},{"./command":14}],23:[function(require,module,exports){
Command = require('./command');

Scaling = function ( value, target)
{
  Command.call( this );
  this.type = "scaling";
  this.value = value;
  this.target = target;
}
Scaling.prototype = Object.create( Command.prototype );
Scaling.prototype.constructor=Scaling;
Scaling.prototype.clone = function()
{
  return new Scaling( this.value.clone(), this.target);
}

Scaling.prototype.undo = function()
{
  this.target.scale.x -= this.value.x;
  this.target.scale.y -= this.value.y;
  this.target.scale.z -= this.value.z;
}

Scaling.prototype.redo = function()
{
  this.target.scale.x += this.value.x;
  this.target.scale.y += this.value.y;
  this.target.scale.z += this.value.z;
}

module.exports = Scaling;

},{"./command":14}],24:[function(require,module,exports){
Command = require('./command');

//FIXME: HAAACK !
Subtraction2 = function ( leftOperand, rightOperands, result)
{
  Command.call( this );
  this.type = "subtraction";
  this.target = leftOperand;
  this.result = result ;
  this.operands = rightOperands || [];

  this._undoBackup = null;
  
}
Subtraction2.prototype = Object.create( Command.prototype );
Subtraction2.prototype.constructor=Subtraction2;
Subtraction2.prototype.clone = function()
{
  return new Subtraction2( this.target, this.operands, this.result );
}
  

Subtraction2.prototype.undo = function()
{
  /*var target = this.target;
  if(!(this._undoBackup)) this._undoBackup = target.geometry.clone();
  target.geometry = this.original.clone();//FIXME: seriously ? how many clones do we need ?*/
  
  //target.updateRenderables();
  //remove resulting shape from view
  var resRenderable = this.result.renderable;
  var resRenderableParent = resRenderable.parent;
  resRenderableParent.remove( resRenderable ) ;
  
  //re-add operands to view
  var leftOpRenderable = this.target.renderable;
  resRenderableParent.add( leftOpRenderable );
  
  var operands = this.operands;
  for(var i = 0; i < operands.length;i++)
  {
      var op = operands[i].renderable;
      resRenderableParent.add( op );
  }
  
}
Subtraction2.prototype.redo = function()
{
  /*var target = this.target;
  target.geometry = this._undoBackup.clone();//FIXME: seriously ? how many clones do we need ?
  
  target.updateRenderables();*/
  var leftOpRenderable = this.target.renderable;
  var leftOpRenderableParent = leftOpRenderable.parent;
  leftOpRenderableParent.remove( leftOpRenderable);
  
  leftOpRenderableParent.add(this.result.renderable);
  
  var operands = this.operands;
  for(var i = 0; i < operands.length;i++)
  {
      var op = operands[i].renderable;
      op.parent.remove( op );
  }
}

module.exports = Subtraction2;

},{"./command":14}],25:[function(require,module,exports){
Command = require('./command');

Translation = function ( value, target)
{
  Command.call( this );
  this.type = "translation";
  this.value = value;
  this.target = target;
}
Translation.prototype = Object.create( Command.prototype );
Translation.prototype.constructor=Translation;
Translation.prototype.clone = function()
{
  return new Translation( this.value.clone(), this.target);
}
/*Not sure about this
Translation.prototype.execute = function(value)
{
    this.target.position.add(value);
}*/

Translation.prototype.undo = function()
{
    this.target.position.sub(this.value);
}

Translation.prototype.redo = function()
{
    this.target.position.add(this.value);
}

module.exports = Translation;

},{"./command":14}],26:[function(require,module,exports){
Command = require('./command');

//FIXME: HAAACK !, should perhaps be closer to esprima node
/*target : result

*/
Union = function ( leftOperand, rightOperands, result )
{
  Command.call( this );
  this.type = "union";
  this.target = leftOperand;
  this.result = result ;
  this.operands = rightOperands || [];
}
Union.prototype = Object.create( Command.prototype );
Union.prototype.constructor=Union;
Union.prototype.clone = function()
{
  return new Union( this.target, this.operands, this.result );
}

Union.prototype.undo = function()
{
  var resRenderable = this.result.renderable;
  var resRenderableParent = resRenderable.parent;
  resRenderableParent.remove( resRenderable ) ;
  
  //re-add operands to view
  var leftOpRenderable = this.target.renderable;
  resRenderableParent.add( leftOpRenderable );
  
  var operands = this.operands;
  for(var i = 0; i < operands.length;i++)
  {
      var op = operands[i].renderable;
      resRenderableParent.add( op );
  }
}
Union.prototype.redo = function()
{
  var leftOpRenderable = this.target.renderable;
  var leftOpRenderableParent = leftOpRenderable.parent;
  leftOpRenderableParent.remove( leftOpRenderable);
  
  leftOpRenderableParent.add(this.result.renderable);
  
  var operands = this.operands;
  for(var i = 0; i < operands.length;i++)
  {
      var op = operands[i].renderable;
      op.parent.remove( op );
  }
}

module.exports = Union;

},{"./command":14}]},{},[11])