var UModule = require("./uModule");

function PartStub(){
  this.children = [];
}
PartStub.prototype.add = function( item ){
}

PartStub.prototype.remove = function( item ){
}

var fakeAssembly = new PartStub();

var uModule = new UModule(fakeAssembly);
uModule.name="foo";
uModule.source="var toto = 24";
uModule.compile();

