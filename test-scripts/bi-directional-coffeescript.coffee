class Foo
  constructor:->
    @var = 15

class Bar extends Foo
	constructor:->
    @boo = "woa"
  
  boomba:=>
    @boo = "42"
  
myFoo = new Foo()
myBar = new Bar()


