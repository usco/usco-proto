function Part()
{
  THREE.Mesh.call(this, undefined, new THREE.MeshNormalMaterial());

  this.__meta = null;
  this._bsp = null;
}
Part.prototype = Object.create( THREE.Mesh.prototype );
Part.prototype.constructor = Part;

Part.prototype.subtract=function(objects)
{

  /*var myWorker = new Worker("lib/shapes/bspWorker.js");
  myWorker.onmessage = function (oEvent) {
    console.log("Called back by the worker!\n");
  };
  myWorker.postMessage("");*/


  if(!( this._bsp ) )
  {
      this._bsp = new ThreeBSP(this);
  }

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
}



function Cube(w,h,d)
{
  this.w = w || 20;
  this.h = h || 20;
  this.d = d || 20;

  Part.call( this );
  this.geometry = new THREE.CubeGeometry( this.w, this.d, this.h );
  //this._bsp = new ThreeBSP(this);
}
Cube.prototype = Object.create( Part.prototype );
Cube.prototype.constructor = Cube;

function Sphere(r)
{
  this.r = r || 10;

  Part.call( this );
  this.geometry = new THREE.SphereGeometry( this.r, 30, 30 );
}
Sphere.prototype = Object.create( Part.prototype );
Sphere.prototype.constructor = Sphere;



