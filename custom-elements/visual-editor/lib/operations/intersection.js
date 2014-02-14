//FIXME: HAAACK !
Intersection = function ( target,originalGeometry, operands)
{
  Command.call( this );
  this.type = "intersection";
  this.target = target;
  this.original = originalGeometry;
  this.operands = operands || [];

  this._undoBackup = null;
}
Intersection.prototype = Object.create( Command.prototype );
Intersection.prototype.constructor=Intersection;
Intersection.prototype.clone = function()
{
  return new Intersection( this.target, this.original, this.operands);
}


Intersection.prototype.undo = function()
{
  var target = this.target;
  this._undoBackup = target.innerMesh.geometry;
  var pos = target.innerMesh.position.clone();
  target.shape.remove( target.innerMesh);
  target.innerMesh = new THREE.Mesh(this.original, target.material);
  target.shape.add( target.innerMesh);
  target.innerMesh.position=pos;
  target.dispatchEvent( { type: 'shapeChanged' } );
}
Intersection.prototype.redo = function()
{
  var target = this.target;
  var pos = target.innerMesh.position.clone();
  target.shape.remove( target.innerMesh);
  target.innerMesh = new THREE.Mesh(this._undoBackup, target.material);
  target.shape.add( target.innerMesh);
  target.innerMesh.position=pos;
  target.dispatchEvent( { type: 'shapeChanged' } );
}
