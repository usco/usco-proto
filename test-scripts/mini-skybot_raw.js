function BigWheel(options)
{
  Part.call( this );
  this.radius 		= options.r || 20 ;
  this.servoHorn  = options.mount || new CircleServoHorn();

  this.union( new Cylinder({r:this.radius}) );
  this.subtract( this.servoHorn );
  
}
BigWheel.prototype = Object.create( Part.prototype );
BigWheel.prototype.constructor = BigWheel;


function CircleServoHorn(options)//technically, non printable !
{
  this.outerRadius = options.or || 10;
  this.servoRadius = options.sr || 3;

  this.union( new Cylinder({r:this.outerRadius}) );
  this.subtract( new Cylinder({r:this.servoRadius}) );
}
CircleServoHorn.prototype = Object.create( Part.prototype );
CircleServoHorn.prototype.constructor = CircleServoHorn;


function SmallWheel(options)
{
  Part.call( this );
 	this.radius = options.r || 5;

  this.union( new Sphere({r:this.radius}) );
}
SmallWheel.prototype = Object.create( Part.prototype );
SmallWheel.prototype.constructor = SmallWheel;

function Chassis(options)
{
  Part.call( this );
  this.size = options.size || [30,50,30];

  this.union( new Cube({size:this.size}) )
}
Chassis.prototype = Object.create( Part.prototype );
Chassis.prototype.constructor = Chassis;

/*Main "wrapper"/container*/
function Skybot(options)
{
  Part.call( this );
  this.bodySize       = options.bodySize || [30,50,30];
  this.bigWheelRadius = options.bigWheelR || 30;

  this.leftWheel  = new BigWheel();
  this.rightWheel = new BigWheel();
  this.backWheel  = new SmallWheel();
  this.body       = new Chassis();

  this.add(this.body);
  this.add( this.leftWheel.translate([this.bodySize.x/2,0,0]) );
  this.add( this.rightWheel.translate([-this.bodySize.x/2,0,0]) );
  this.add(this.backWheel.translate([0,-this.bodySize.y,0]));
}
Skybot.prototype = Object.create( Part.prototype );
Skybot.prototype.constructor = Skybot;

/*do the assembly*/

var skybot = new Skybot();

assembly.add(skybot);


////////////////////////////////////
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

