class foo
  constructor:->
  	@bar = 43

class bar extends foo
  
myFoo = new foo()
myBar = new bar()
