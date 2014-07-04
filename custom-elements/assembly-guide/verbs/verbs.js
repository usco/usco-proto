
//base class for various assembly methods      
function AssemblyMethod(name, target)
{
  this.name = name;
  this.target = target;
  this._animations = [];
}

AssemblyMethod.prototype.start = function()
{
  for(var i= 0; i< this._animations.length;i++)
  {
     this._animations[i].start();
  }
}
//Action verbs for assembly methods
function PlaceItem()

function ScrewItem(name, item, turns, distance ,duration)
{
   //for now not based on actual calculations (pitch, lead, nb of starts etc)
  this.duration = duration || 1500;
  this.turns = turns || 0;
  this.distance = distance || 0;        
  var target = this.item;

  var curPos = target.position;
  var curRot = target.rotation;
  
  var translation = new TWEEN.Tween( target.position )
  .to( { x: pos.x, y: pos.y, z:offs }, this.duration )
  .yoyo(true)
  .easing( TWEEN.Easing.Exponential.Out);

  var r = turns * Math.PI*2 + curRot.rotation.z;
  var rotation = new TWEEN.Tween( target.rotation )
    .to( { z:r}, this.duration )
    .yoyo(true)
    .easing( TWEEN.Easing.Exponential.Out);

  this._animations.push( translation );
  this._animations.push( rotation );
  return this;
}

function SlideItem(){}
function PressItem(){}
