var ASTManipulator = require("../code-analysisAndTrace/ast-manipulator");


function UModule(assembly)
{
  this.name = "fooModule";
  this.source=null;
  this.compiledSource=null;
  
  this.exports = {};
  this.include = function(){};
  this.importGeom = function(){};
  
  //language detection
  this.sourceLanguage = "js";
  this.assembly = assembly || {} ;//new THREE.Object3D();//TODO: how to handle this dependency : should be usco PART instance
  
  //for part instance tracing
  this.partInstancesByType = {};
  this.codeLocToinstances  = {};
  
  //TODO: should this be passed in ? (ie not one per module)
  //ast manipulation utilities
  this.astUtil = new ASTManipulator(this.source);
}
UModule.prototype.constructor = UModule;


//Determine if coffeescript or javascript
UModule.prototype.detectLanguage=function()
{
  var source = this.source;
  var coffeeSymbols = ["class", "->", "=>", "extends"];//not totally true for harmony
  var jsSymbols = ["var", "function"];
  for(var i=0;i<jsSymbols.length;i++)
  {
    var token = jsSymbols[i];
    if( source.indexOf(token) != -1 ){
      this.sourceLanguage = "js";
      return; }
  } 

  for(var i=0;i<coffeeSymbols.length;i++)
  {
    var token = coffeeSymbols[i];
    if( source.indexOf(token) != -1 ){
      this.sourceLanguage = "coffee";
      return;}
  } 
},
UModule.prototype._wrapCode=function(code)
{
   //var pre = "var assembly =  THREE.Object3D();\n"
   var pre = "return (function ( exports, include, importGeom, module, __filename, assembly)";
    pre +="{";
    pre += "var partInstancesByType = module.partInstancesByType;\n";
    pre += "var codeLocToinstances = module.codeLocToinstances;\n";
    pre += code;
    pre += "});";

   var result = pre;
   //console.log("result", result);
   return result
},

UModule.prototype.compile=function()
{
  console.log("Language",this.sourceLanguage);
  //////////////////////////////////////////
  //reset everything before compiling again
  //clear root assembly
  var child, i;
  for ( i = this.assembly.children.length - 1; i >= 0 ; i -- ) {
      child = this.assembly.children[ i ];
      this.assembly.remove(child);
  }
  //reset instances count
  this.partInstancesByType = {};
  this.codeLocToinstances  = {};
  ////////////////////////////////////////////

  var source = this.source;
  if(this.sourceLanguage == "coffee")
  {
    var pseudoModuleName = this.name+".coffee";
    console.log("generating from coffeescript, pseudo module name", pseudoModuleName);

    //coffeescript redux only
    /*
    var csAST = CoffeeScript.parse(this.source, {optimise: false, raw: true});
    console.log("coffee ast", csAST);
    var jsAST = CoffeeScript.compile(csAST, {bare: true});
    var compiledSource = this.compiledSource = CoffeeScript.js(jsAST, {compact: false,sourceMap:true,sourceMapFile:pseudoModuleName});
    console.log("compiledSource", compiledSource);
    this.compiledSource = compiledSource;//we keep the generate js
    //this.ast = jsAST;*/
    
    var compiledSourceData = CoffeeScript.compile(source,{bare:true,sourceMap:true,filename:pseudoModuleName});
    var compiledSource = compiledSourceData.js;
    console.log("compiled coffee", compiledSource);
    this.compiledSource = compiledSource;//we keep the generate js

    var srcMap = JSON.parse(compiledSourceData.v3SourceMap);
    console.log("source map", srcMap);
    srcMap.sources = []
    srcMap.sources.push( pseudoModuleName )
    srcMap.file = "out.js"; 

    this.sourcemapConsumer = new sourceMap.SourceMapConsumer(srcMap);
    console.log("sourcemapConsumer",this.sourcemapConsumer);

    this.astUtil.source = compiledSource;
    source = compiledSource;
  }
  else
  {
    this.astUtil.source = source;
  }

  //generate ast, transform it
  this.astUtil.generateAst(source);
  this.astUtil.traverseAst();
  var alteredSource = source;
  alteredSource = this.astUtil.fallafelTest(source);
  //console.log("AlteredSource, first pass:\n", alteredSource);
  alteredSource = this.astUtil.injectTracing(alteredSource);
  console.log("AlteredSource, second pass:\n", alteredSource);

  //wrap modified source with module elements       
  var endSource = this._wrapCode(alteredSource);

  //compile "module"
  console.log("compiling");
  var startTime = new Date();
  try
  {
    var f = new Function(endSource);
    var fn = f();
    var result = fn.call(fn, this.exports, this.include, this.importGeom, this, this.name , this.assembly)
    console.log("result",this.assembly,this.partInstancesByType, this.codeLocToinstances);
  }
  catch(error)
  {
    console.log("failed to compile:", error.name + ': ' + error.message);
  }
  var endTime = new Date();
  var elapsed = endTime - startTime;
  console.log("code compiling took:"+ elapsed)
},

UModule.prototype.analyze=function()
{
  this.astUtil.generateAst(this.compiledSource);
},
UModule.prototype.traverseAst=function()
{
  this.astUtil.traverseAst();
},
UModule.prototype.experiment=function()
{
  this.astUtil.fallafelTest(this.source);
}

module.exports = UModule;
