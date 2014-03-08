function Part()
{
  var material = new THREE.MeshPhongMaterial( { color: 0x17a9f5, specular: 0xffffff, shininess: 10,shading: THREE.FlatShading} ); 
  THREE.Mesh.call(this, undefined, material);

  //holds object meta data ("reflexion", links between code and visual etc
  this.__meta = null;
  
  //curent implementation uses bsp under the hood...
  this._bsp = null;
  
  //this is an abstract element, but it needs a visual representation
  this.renderable = null;
}
Part.prototype = Object.create( THREE.Mesh.prototype );
Part.prototype.constructor = Part;

Part.prototype._clone = function()
{
  return ;
}

Part.prototype.generateRenderables=function()
{
  var material = new THREE.MeshPhongMaterial( { color: 0x17a9f5, specular: 0xffffff, shininess: 10,shading: THREE.FlatShading} ); 
}

Part.prototype.fromThreeMesh=function(object){}

Part.prototype.attributeChanged = function(attrName, oldVal, newVal)
{

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
  this.w = options.w || 20;
  this.h = options.h || 20;
  this.d = options.d || 20;

  Part.call( this );
  this.geometry = new THREE.CubeGeometry( this.w, this.d, this.h );
  //this._bsp = new ThreeBSP(this);
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

Cube.prototype.generateRenderables=function()
{
  Part.prototype.generateRenderables.call(this);
  var material = new THREE.MeshPhongMaterial( { color: 0x17a9f5, specular: 0xffffff, shininess: 10,shading: THREE.FlatShading} );
  
  
  this.renderable = new THREE.Mesh( this.geometry, material);//new THREE.Mesh( new THREE.CubeGeometry( this.w, this.d, this.h ), material);
  this.renderable.sourceShape = this;
  
  this.renderable.position = this.position;
  this.renderable.rotation = this.rotation;
  this.renderable.scale    = this.scale;
  this.renderable.matrix   = this.matrix;
  this.renderable.matrixWorld   = this.matrixWorld;
  this.renderable._rotation = this._rotation ;
	this.renderable._quaternion = this._quaternion;
  
  return this.renderable;
}

Cube.prototype.updateRenderables=function()
{
  //this.renderable.geometry.dispose();
  //delete this.renderable.__webglInit;
  //this.renderable.geometry =  new THREE.CubeGeometry( this.w, this.d, this.h ); 
}


function Sphere(options)
{
  this.r = options.r || 10;
  this.$fn = options.$fn || 10;

  Part.call( this );
  this.geometry = new THREE.SphereGeometry( this.r, 30, 30 );
}
Sphere.prototype = Object.create( Part.prototype );
Sphere.prototype.constructor = Sphere;

Sphere.prototype.generateRenderables=function()
{
  Part.prototype.generateRenderables.call(this);
  var material = new THREE.MeshPhongMaterial( { color: 0x17a9f5, specular: 0xffffff, shininess: 10,shading: THREE.FlatShading} );
  this.renderable = new THREE.Mesh( new THREE.SphereGeometry( this.r, this.$fn, this.$fn ), material);
  this.renderable.sourceShape = this;
  return this.renderable;
}

Sphere.prototype.updateRenderables=function()
{
  this.renderable.geometry.dispose();
  delete this.renderable.__webglInit;
  this.renderable.geometry =  new THREE.SphereGeometry( this.r, this.$fn, 20 ); 
}


function Cylinder(options)
{
  this.r = options.r || 10;
  this.h = options.h || 10;
  this.$fn = options.$fn || 10;

  Part.call( this );
  this.geometry = new THREE.CylinderGeometry( this.r, this.r, this.h ,this.$fn,this.$fn);
}
Cylinder.prototype = Object.create( Part.prototype );
Cylinder.prototype.constructor = Cylinder;

Cylinder.prototype.generateRenderables=function()
{
  Part.prototype.generateRenderables.call(this);
  var material = new THREE.MeshPhongMaterial( { color: 0x17a9f5, specular: 0xffffff, shininess: 10,shading: THREE.FlatShading} );
  var geometry = new THREE.CylinderGeometry( this.r, this.r, this.h ,this.$fn,this.$fn)
  geometry.applyMatrix(new THREE.Matrix4().makeRotationX( Math.PI / 2 ));
  
  this.renderable = new THREE.Mesh( geometry , material);
  this.renderable.sourceShape = this;
  return this.renderable;
}

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

Torus.prototype.generateRenderables=function()
{
  Part.prototype.generateRenderables.call(this);
  var material = new THREE.MeshPhongMaterial( { color: 0x17a9f5, specular: 0xffffff, shininess: 10,shading: THREE.FlatShading} );
  var geometry = new THREE.TorusGeometry( this.r,this.tube , this.$fn, this.$fn);
  //geometry.applyMatrix(new THREE.Matrix4().makeRotationX( Math.PI / 2 ));
  
  this.renderable = new THREE.Mesh( geometry , material);
  this.renderable.sourceShape = this;
  return this.renderable;
}

Torus.prototype.updateRenderables=function()
{
  this.renderable.geometry.dispose();
  delete this.renderable.__webglInit;
  var geometry = new THREE.TorusGeometry( this.r,this.tube , this.$fn, this.$fn);
  this.renderable.geometry = geometry;
}
              
