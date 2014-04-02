
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
