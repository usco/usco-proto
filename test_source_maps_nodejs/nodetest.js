var fs = require("fs");
var sourceMap = require('source-map');

var rawSourceMap = fs.readFileSync("inputTest.map")
rawSourceMap = JSON.parse(rawSourceMap);
 
var smc = new sourceMap.SourceMapConsumer(rawSourceMap);

var originalPosition = {
  source: 'inputTest.coffee',
  line: 2,
  column: 2
};
var convertedCoords = smc.generatedPositionFor(originalPosition)
console.log("convertedCoords",convertedCoords );

var convertedPosition = {
  line:3,
  column:1
};
var originalCoords = smc.originalPositionFor(convertedPosition)
console.log("originalCoords",originalCoords );

var originalSource = smc.sourceContentFor('inputTest.coffee');
console.log("originalSource", originalSource);
