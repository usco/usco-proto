function BigWheel(options)
{
  Part.call( this );
  this.radius 		= options.r || 20 ;
  this.servoHorn  = options.mount || new CircleServoHorn();
  
}
BigWheel.prototype = Object.create( Part.prototype );
BigWheel.prototype.constructor = BigWheel;


function SmallWheel(options)
{
  Part.call( this );
 	this.radius = options.r || 5;
}
SmallWheel.prototype = Object.create( Part.prototype );
SmallWheel.prototype.constructor = SmallWheel;

function Chassis(options)
{
  Part.call( this );
  this.size = options.size || [30,50,30];
}
Chassis.prototype = Object.create( Part.prototype );
Chassis.prototype.constructor = Chassis;


function BatteryHolder(options)
{
}

/*non printed*/
function UltraSoundSensor(options)
{

  this.printable = false;
}

function Electronics(options)
{
}

function Battery(options)
{}

function Nut(options){}

function Bolt(options){}

