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
  
  this.renderable.position = this.position;
  this.renderable.rotation = this.rotation;
  this.renderable.scale    = this.scale;
  this.renderable.matrix   = this.matrix;
  this.renderable.matrixWorld   = this.matrixWorld;
  this.renderable._rotation = this._rotation ;
	this.renderable._quaternion = this._quaternion;
	
	this.renderable._rotation._quaternion = this.quaternion;
	this.renderable._quaternion._euler = this.rotation;
	
	
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
  var operation = new Translation( amount, this );
  var event = new CustomEvent('newOperation',{detail: {msg: operation}});
  document.dispatchEvent(event);
  
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
  this._bsp = new ThreeBSP(this);
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
  }
}

Part.prototype.intersect=function(objects)
{
  this._bsp = new ThreeBSP(this);
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
  }
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
  //var operation = new Subtraction(newPart, oldGeometry, operands ) ;
  var operation = new Subtraction2(this, operands, newPart)
  newPart.operations.push ( operation );
  
  var event = new CustomEvent('newOperation',{detail: {msg: operation}});
  document.dispatchEvent(event);
  
  return newPart;
  
}

module.exports = Part
