function GeometryWrapper(geometry)
{
   THREE.Geometry.call( this );
   this.setWrap(geometry);
}
GeometryWrapper.prototype = Object.create( THREE.Geometry.prototype );
GeometryWrapper.prototype.constructor = GeometryWrapper;

GeometryWrapper.prototype.setWrap = function( geometry)
{
  if(this.geometry) this.geometry.dispose();
  this.geometry = geometry;
   
   var self = this;
   var specials = ["vertices","colors","faces","faceVertexUvs","morphTargets",
      "morphColors","morphNormals","skinWeights","skinIndices","lineDistances","boundingBox",
      "boundingSphere","hasTangents","dynamic",
      "verticesNeedUpdate","elementsNeedUpdate","uvsNeedUpdate","normalsNeedUpdate","tangentsNeedUpdate",
      "colorsNeedUpdate","lineDistancesNeedUpdate","buffersNeedUpdate"
     ];

   function createSetGetFor(name)
   {
      console.log("adding get/set for", name);
      self.__defineGetter__(name, function(){
            //console.log("using getter for",name);
            return self.geometry[name];
        });
      self.__defineSetter__(name, function(val){
          self.geometry[name] = val;
      });
    }
  
   for (var name in this.geometry) {
    if (geometry.hasOwnProperty(name) && specials.indexOf(name) > -1 ) {

      createSetGetFor(name);
    }
  }

  /*this.verticesNeedUpdate = true;
	this.elementsNeedUpdate = true;
	this.uvsNeedUpdate = true;
	this.normalsNeedUpdate = true;
	this.tangentsNeedUpdate = true;
	this.colorsNeedUpdate = true;
	this.lineDistancesNeedUpdate = true;

	this.buffersNeedUpdate = true;*/
  

}

GeometryWrapper.prototype.applyMatrix = function(matrix)
{
  this.geometry.applyMatrix(matrix);
}

GeometryWrapper.prototype.computeCentroids = function()
{
  this.geometry.computeCentroids();
}
GeometryWrapper.prototype.computeFaceNormals = function()
{
  this.geometry.computeFaceNormals();
}
GeometryWrapper.prototype.computeVertexNormals = function(ar)
{
  this.geometry.computeVertexNormals(ar);
}
GeometryWrapper.prototype.computeMorphNormals = function()
{
  this.geometry.computeMorphNormals();
}
GeometryWrapper.prototype.computeTangents = function()
{
  this.geometry.computeTangents();
}

GeometryWrapper.prototype.computeLineDistances = function()
{
  this.geometry.computeLineDistances();
}
GeometryWrapper.prototype.computeBoundingBox = function()
{
  this.geometry.computeBoundingBox();
}
GeometryWrapper.prototype.computeBoundingSphere = function()
{
  this.geometry.computeBoundingSphere();
}


function Shape(geometry, material)
{
    var wrapper = new GeometryWrapper(geometry);
    THREE.Mesh.call( this, wrapper, material );
}
Shape.prototype = Object.create( THREE.Mesh.prototype );
Shape.prototype.constructor = Shape;

function Part(geometry, material)
{
        THREE.Object3D.call( this );
        this.shape = new THREE.Object3D();//indirection -> the instance of geometry should always be the same, regardless of content
        this.material = material; 

        this.add(this.shape);
        this.innerMesh = new THREE.Mesh(geometry,material);

        this.shape.add( this.innerMesh );


        this.__defineGetter__('geometry', function(){
            //console.log("using getter for",name);
            return this.innerMesh.geometry;
        });
}

Part.prototype = Object.create( THREE.Object3D.prototype );
Part.prototype.constructor = Part;

Part.prototype.clone = function( object, recursive )
{
		if ( object === undefined ) { object = new Part(); object.remove(object.shape); object.children=[];}
		if ( recursive === undefined ) recursive = true;

		object.name = this.name;

		object.up.copy( this.up );

		object.position.copy( this.position );
		object.quaternion.copy( this.quaternion );
		object.scale.copy( this.scale );

		object.renderDepth = this.renderDepth;

		object.rotationAutoUpdate = this.rotationAutoUpdate;

		object.matrix.copy( this.matrix );
		object.matrixWorld.copy( this.matrixWorld );

		object.matrixAutoUpdate = this.matrixAutoUpdate;
		object.matrixWorldNeedsUpdate = this.matrixWorldNeedsUpdate;

		object.visible = this.visible;

		object.castShadow = this.castShadow;
		object.receiveShadow = this.receiveShadow;

		object.frustumCulled = this.frustumCulled;

		object.userData = JSON.parse( JSON.stringify( this.userData ) );

		if ( recursive === true ) {

			for ( var i = 0; i < this.children.length; i ++ ) {

				var child = this.children[ i ];
        var dup = child.clone();
				object.add( dup );

        if(child == this.shape)
        {
          console.log("foo");
          object.shape=dup;
          object.material = this.material.clone();
          object.innerMesh = object.shape.children[0];
        }

			}

		}
    //object.shape = object.children[0];
    //object.innerMesh = object.shape.children[0];
    
		return object;
}

Part.prototype.swapGeometry = function( otherGeometry )
{
  this.shape = otherGeometry;
}


//possible hack for three.js geometry update
THREE.Geometry.prototype.copy=function( otherGeometry )
{
  this.verticesNeedUpdate = true;
	this.elementsNeedUpdate = true;
	this.uvsNeedUpdate = true;
	this.normalsNeedUpdate = true;
	this.tangentsNeedUpdate = true;
	this.colorsNeedUpdate = true;
	this.lineDistancesNeedUpdate = true;

	this.buffersNeedUpdate = true;

  var vertices = this.vertices;
  var otherVertices = otherGeometry.vertices;
  this.vertices = [];

		for ( var i = 0, il = otherVertices.length; i < il; i ++ ) {

			vertices.push( otherVertices[ i ].clone() );

		}

		var faces = this.faces;
    this.faces = [];
    var otherFaces = otherGeometry.faces;

		for ( var i = 0, il = otherFaces.length; i < il; i ++ ) {

			faces.push( otherFaces[ i ].clone() );

		}

		/*var uvs = this.faceVertexUvs[ 0 ];
    uvs = [];
    var otherUvs = otherGeometry.faceVertexUvs[ 0 ];


		for ( var i = 0, il = otherUvs.length; i < il; i ++ ) {

			var uv = otherUvs[ i ], uvCopy = [];

			for ( var j = 0, jl = uv.length; j < jl; j ++ ) {

				uvCopy.push( new THREE.Vector2( uv[ j ].x, uv[ j ].y ) );

			}

			this.geometry.faceVertexUvs[ 0 ].push( uvCopy );

		}*/

		return this;
}

