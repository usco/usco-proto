//FIXME: HAAACK !
Union = function ( target, originalGeometry)
{
  Command.call( this );
  this.type = "union";
  this.target = target;
  this.original = originalGeometry;

  this._undoBackup = null;
}
Union.prototype = Object.create( Command.prototype );
Union.prototype.constructor=Union;
Union.prototype.clone = function()
{
  return new Union( this.target, this.original);
}

Union.prototype.undo = function()
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

Union.prototype.redo = function()
{
  var target = this.target;
  var pos = target.innerMesh.position.clone();
  target.shape.remove( target.innerMesh);
  target.innerMesh = new THREE.Mesh(this._undoBackup, target.material);
  target.shape.add( target.innerMesh);
  target.innerMesh.position=pos;
  target.dispatchEvent( { type: 'shapeChanged' } );
}
