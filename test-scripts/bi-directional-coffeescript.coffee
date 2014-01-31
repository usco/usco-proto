class Foo
  constructor:->
    @var = 15

class Bar
	constructor:->
    @boo = "woa"
  
  boomba:=>
    @boo = "42"
  
myFoo = new Foo()
myBar = new Bar()
