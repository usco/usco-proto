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
  this.color = 0x17a9f5;
  //"r" is for "real", for now, do not overrid three.js material property
  this.rMaterial = null;
  
  this.connectors = [];
  
  //just for testing
  var testConnector = new Connector();
  testConnector.up = new THREE.Vector3(0,0,1);
  testConnector.position.z = 10;
  this.add( testConnector );
  this.connectors.push( testConnector );
  
  var testConnector2 = new Connector();
  testConnector2.up = new THREE.Vector3(0,0,-1);
  testConnector2.position.z = -10;
  this.add( testConnector2 );
  
  this.connectors.push( testConnector2 );
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
  return newInstance;
}

Part.prototype.generateRenderables=function()
{
  var material = new THREE.MeshPhongMaterial( { color: this.color, specular: 0xffffff, shininess: 10,shading: THREE.FlatShading} ); 
  
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

Part.prototype.fromThreeMesh=function(object){}

Part.prototype.attributeChanged = function(attrName, oldVal, newVal)
{}

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

Part.prototype.translate=function( amount )
{
  var operation = new Translation( amount, this );
  var event = new CustomEvent('newOperation',{detail: {msg: operation}});
  document.dispatchEvent(event);
  return operation;
}

Part.prototype.rotate=function( amount )
{
  var operation = new Rotation( amount, this);
  this.operations.push( operation );
}

Part.prototype.scale=function( amount )
{
  var operation = new Scaling( amount, this);
  this.operations.push( operation );
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
  /*var myWorker = new Worker("lib/shapes/bspWorker.js");
  myWorker.onmessage = function (oEvent) {
    console.log("Called back by the worker!\n");
  };
  myWorker.postMessage("");*/

  //if(!( this._bsp ) )
  //{
      this._bsp = new ThreeBSP(this);
  //}
  for(var i=0;i<objects.length;i++)
  {
    var object = objects[i];
    /* TODO: find a way to do this without regenerating the bsp*/    
    /*if(!( object._bsp ) )
    {
        object._bsp = new ThreeBSP(object);
    }
    else
    { 
      console.log("object matrix",object._bsp.matrix.elements);
      //object.updateMatrix();
      //object._bsp.matrix.copy( object.matrix );
      console.log("object matrix",object._bsp.matrix.elements);

      var matrix = object._bsp.matrix;
      var matrix = new THREE.Matrix4();//.getInverse( matrix );
      var polygons = object._bsp.tree.allPolygons(),
			polygon_count = polygons.length;

      for ( var z = 0; z < polygon_count; z++ ) 
      {
        polygon = polygons[z];
			  polygon_vertice_count = polygon.vertices.length;
        for ( j = 2; j < polygon_vertice_count; j++ ) {
				  vertex = polygon.vertices[0];
          if(z==0) console.log("vertex", vertex);
				  vertex.applyMatrix4(matrix);
          vertex = polygon.vertices[j-1];
          vertex.applyMatrix4(matrix);
          vertex = polygon.vertices[j];
          vertex.applyMatrix4(matrix);
        }
        polygon.calculateProperties();
      }
          object._bsp.tree = new ThreeBSP.Node( polygons );
          delete object.__webglInit;
     object.geometry.dispose();
     object.geometry = object._bsp.toGeometry();
    }*/
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
}



function Cube(options)
{
  options = options || {};
  this.w = options.w || 20;
  this.h = options.h || 20;
  this.d = options.d || 20;

  Part.call( this );
  this.name = "Cube"+this.id;
  this.geometry = new THREE.CubeGeometry( this.w, this.d, this.h );
  //this._bsp = new ThreeBSP(this);
  //this.properties["w"] = {"width", "Width of the cuboid",20}
  //this.properties["h"] = {"height", "height of the cuboid",20}
  //this.properties["d"] = {"depth", "depth of the cuboid",20}
}
Cube.prototype = Object.create( Part.prototype );
Cube.prototype.constructor = Cube;

Cube.prototype.update=function( parameters )
{
  Part.prototype.update.call(this, parameters);
  //this.geometry.dispose();
  //delete this.__webglInit;
  //this.geometry = new THREE.CubeGeometry( this.w, this.d, this.h );
}

Cube.prototype.updateRenderables=function()
{
  //this.renderable.geometry.dispose();
  //delete this.renderable.__webglInit;
  //this.renderable.geometry =  new THREE.CubeGeometry( this.w, this.d, this.h ); 
}


function Sphere(options)
{
  options = options || {};
  this.r = options.r || 10;
  this.$fn = options.$fn || 10;

  Part.call( this );
  this.geometry = new THREE.SphereGeometry( this.r, 30, 30 );
}
Sphere.prototype = Object.create( Part.prototype );
Sphere.prototype.constructor = Sphere;


Sphere.prototype.updateRenderables=function()
{
  this.renderable.geometry.dispose();
  delete this.renderable.__webglInit;
  this.renderable.geometry =  new THREE.SphereGeometry( this.r, this.$fn, 20 ); 
}


function Cylinder(options)
{
  options = options || {};
  this.r = options.r || 10;
  this.h = options.h || 10;
  this.$fn = options.$fn || 10;

  Part.call( this );
  this.geometry = new THREE.CylinderGeometry( this.r, this.r, this.h ,this.$fn,this.$fn);
  this.geometry.applyMatrix(new THREE.Matrix4().makeRotationX( Math.PI / 2 ));
}
Cylinder.prototype = Object.create( Part.prototype );
Cylinder.prototype.constructor = Cylinder;


Cylinder.prototype.updateRenderables=function()
{
  this.renderable.geometry.dispose();
  delete this.renderable.__webglInit;
  var geometry = new THREE.CylinderGeometry( this.r, this.r, this.h ,this.$fn,this.$fn)
  geometry.applyMatrix(new THREE.Matrix4().makeRotationY( Math.PI/2));
  this.renderable.geometry = geometry;
}


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
}
Torus.prototype = Object.create( Part.prototype );
Torus.prototype.constructor = Torus;


Torus.prototype.updateRenderables=function()
{
  this.renderable.geometry.dispose();
  delete this.renderable.__webglInit;
  var geometry = new THREE.TorusGeometry( this.r,this.tube , this.$fn, this.$fn);
  this.renderable.geometry = geometry;
}
              
