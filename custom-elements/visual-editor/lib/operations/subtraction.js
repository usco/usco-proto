//FIXME: HAAACK !
Subtraction = function ( target,originalGeometry, operands)
{
  Command.call( this );
  this.type = "subtraction";
  this.target = target;
  this.original = originalGeometry;
  this.operands = operands || [];

  this._undoBackup = null;
  
}
Subtraction.prototype = Object.create( Command.prototype );
Subtraction.prototype.constructor=Subtraction;
Subtraction.prototype.clone = function()
{
  return new Subtraction( this.target, this.original, this.operands);
}

Subtraction.prototype.undo = function()
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
Subtraction.prototype.redo = function()
{
  var target = this.target;
  var pos = target.innerMesh.position.clone();
  target.shape.remove( target.innerMesh);
  target.innerMesh = new THREE.Mesh(this._undoBackup, target.material);
  target.shape.add( target.innerMesh);
  target.innerMesh.position=pos;
  target.dispatchEvent( { type: 'shapeChanged' } );
}
