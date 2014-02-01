var sourceMap = require('source-map');
var coffeeScript =require('coffee-script');

var src="class Foo\n \nclass Bar\n \n\nmyFoo = new Foo()\nmyBar = new Bar()"


CoffeeScript.compile(source,{bare:true,sourceMap:true,filename:pseudoModuleName});


rawSourceMap = JSON.parse(rawSourceMap);
 
var smc = new sourceMap.SourceMapConsumer(rawSourceMap);

var originalPosition = {
  source: 'inputTest.coffee',
  line: 6,
  column: 3
};

var convertedCoords = smc.generatedPositionFor(originalPosition)

console.log("convertedCoords",convertedCoords );
