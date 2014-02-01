function ASTManipulator(source)
{
  this.source = source;
  this.ast    = null;
  this.lang   = "js";
  
  this._functions = null;
  this._classes = null;

  this._nodeIdPerLang = {};
  this._nodeIdPerLang["js"]     = new ASTNodeIdentificator(); //TODO: perhaps static methods are enough
  this._nodeIdPerLang["coffee"] = new ASTNodeIdentificatorCoffee();
}


/*Add tracing code to a "class" instance declaration node
* @param: node : the node into which to inject the tracing code
* @param: functions : a list of pre-parsed functions
* @param: classes : a list of pre-parsed classes
*/
ASTManipulator.prototype.injectInstanceTracingCode = function(node, functions, classes)
{
  if(node.id)
  { //in a declaration assignement
    var instanceName = node.id.name;
    var className = node.init.callee.name;
    var instanceRange = node.id.range;
  }
  else if(node.expression.left)
  {
    //simple assignement
    var instanceName = node.expression.left.name;
    var className = node.expression.right.callee.name;
    var instanceRange = node.expression.left.range;
  }
  else{return}
  console.log("created one instance of", className);
  console.log("node", node);

  var updatedSource = node.source();
  updatedSource += ";\n if(!('instancesData' in "+instanceName+".__meta)){"+instanceName+".__meta.instancesData=[]}"
  updatedSource += ";\n"+instanceName+".__meta.instancesData.push({range: [ " + instanceRange[0] + ", " + instanceRange[1] + "]})\n"

  //instances tracking
  updatedSource += "codeLocToinstances['"+instanceRange[0] + ", " + instanceRange[1]+"']="+ instanceName +";\n";

  console.log("updated source to inject instance tracking", updatedSource);
  node.update(updatedSource);
}



//MAIN METHODS
ASTManipulator.prototype.generateAst=function(source)
{
  var startTime = new Date();
  try
  {
    var ast = esprima.parse(source,{loc:true, range:true, tolerant:true});
    var scope = escope.analyze(ast);
    //console.log("ast",ast,"scope", scope);
    this.ast = ast;
  }
  catch(error)
  {
      console.log("failed to generate ast:", error.name + ': ' + error.message);
  }
  var endTime = new Date();
  var elapsed = endTime - startTime;
  console.log("AST generation took:"+ elapsed)
}

ASTManipulator.prototype.traverseAst=function()
{
    console.log("traversing ast")
    var functions = {};
    var classes = {};

    var lang   = this.lang;
    var source = this.source;

    //shortcuts to helpers
    var isInst  = this._nodeIdPerLang[lang]._isNodeAVariableDeclaration;
    var isAsign = this._nodeIdPerLang[lang]._isNodeAVariableAsignment;
    var isFunct = this._nodeIdPerLang[lang]._isNodeAFunctionDeclaration;
    var isClass = this._nodeIdPerLang[lang]._isNodeAClassDeclaration;

    var addFunct = this._nodeIdPerLang[lang]._addNodeToFunctions;
    var addClass = this._nodeIdPerLang[lang]._addNodeToClasses;

    estraverse.traverse(this.ast, {
        enter: function (node, parent) {
            //console.log("node",node)
            if( isFunct(node) )
            {
              addFunct( node, functions);
              return estraverse.VisitorOption.skip;
            }
            else if(node.type == 'Identifier' && node.name in functions)
            {
            }
            else if( isInst( node, classes ) )
            {
            }
            else if( isClass(node, functions) )
            { 
              addClass( node, functions, classes );
            }
        },
        leave: function (node, parent) {
          if (node.type == 'FunctionExpression' || node.type == 'FunctionDeclaration')
              return estraverse.VisitorOption.Skip;
        }
    });
    console.log("Functions",functions);
    console.log("classes",classes);
    this._classes = classes;
    this._functions = functions;
}


ASTManipulator.prototype.injectTracing= function(source)
{
  //function entry/exit experiments
  functionEntrytracer = esmorph.Tracer.FunctionEntrance(function(fn) {
        var signature;
        console.log("function:",fn,"\n");
        return ""
         /*if (fn.name !== "ctor") {
          return signature = "this.__meta = {\n  lineNumber: " + fn.line + ", \n  range: [ " + fn.range[0] + ", " + fn.range[1] + "]\n}";
        } else {
          return "";
        }*/
      });
  functionEndtracer = esmorph.Tracer.FunctionExit(function(fn) {
        if(fn.name == "[Anonymous]" || fn.name == "__extends" || fn.name == "ctor") return "";//for coffeescript
        //if (fn.name === "Part") return "";
        var additions = "";
        //instance metadata
        //TODO: cleanup : we don't need could, instances list.length should be enough
        additions += "if(! ('"+fn.name +"' in partInstancesByType)) partInstancesByType['"+fn.name+"']={count:0,instances:[]};\n"; 
        additions += "partInstancesByType['"+fn.name+"'].count+=1;\n";
        additions += "partInstancesByType['"+fn.name+"'].instances.push(this);\n";

        //positional metadata
        additions += "   this.__meta = {\n  lineNumber: " + fn.line + ", \n  range: [ " + fn.range[0] + ", " + fn.range[1] + "]\n}";
        //TODO: add instance tracing
        additions += "";
        return additions;
      });

  var outSource = esmorph.modify(source, [functionEntrytracer, functionEndtracer])
  //console.log("outputSource",outSource);
  return outSource;
}

ASTManipulator.prototype.fallafelTest = function(source)
{
    console.log("fallafel test");
    //console.log("functions", this._functions, "classes", this._classes);
    /*TWO SEPERATE ASPECTS: (therefore splitable into seperate methods)
      - node identification
      - node alteration
    */
    var output = "";
    var functions = this._functions;
    var classes = this._classes;

    //shortcuts to helpers
    var lang = this.lang;
    var isInst  = this._nodeIdPerLang[lang]._isNodeAVariableDeclaration;
    var isAsign = this._nodeIdPerLang[lang]._isNodeAVariableAsignment;
    var isFunct = this._nodeIdPerLang[lang]._isNodeAFunctionDeclaration;
    var isClass = this._nodeIdPerLang[lang]._isNodeAClassDeclaration;
    //
    var addFunct = this._nodeIdPerLang[lang]._addNodeToFunctions;
    var addClass = this._nodeIdPerLang[lang]._addNodeToClasses;
    //
    var addInstTracing = this.injectInstanceTracingCode;

   var output = falafel(source, {ast:this.ast}, function (node) {
      console.log("node", node);
      if(node.type == 'VariableDeclaration')
      {
          //console.log("var declaration", node);
      }
      if(isInst( node, classes))
      {
        addInstTracing( node, functions, classes );
      }
      if(isAsign( node, classes ))
      {
        console.log("gne",node);
        addInstTracing( node, functions, classes );
      }
    });
    //console.log("output", output);
    var result = output.toString();
    //console.log("result", result);
    return result;
}


/*old stuff, kept for reference for now

if (node.type == 'FunctionExpression' || node.type == 'FunctionDeclaration')
            {
              if(node.id !== null && node.id !== undefined )
              {
              var name = node.id.name;
              functions[name] = {range:node.range};
              //console.log("function",name, "range", node.range, "node",node);
              return estraverse.VisitorOption.skip;
              }
            }


JS "class" detection
console.log("asignment", node.right.arguments, node);

              //"class detection"
              
              if(node.left.object && node.left.object.name && node.right.arguments && node.right.arguments.length >0 && node.right.arguments[0].property && node.right.arguments[0].property.name)
              {
                var className = node.left.object.name;
                var bla = node.right.type == "CallExpression" && node.right.arguments[0].property && node.right.arguments[0].property.name =="prototype"

                if( className in functions && node.left.property.name === "prototype" && bla)
                {
                  var className = node.left.object.name;
                  //var range = functions[]
                  classes[className]={range:functions[className].range};
                }
              }
            }

//used in falafel for keyword detection:
    function isKeyword (id) {
        if (id === 'beep') return true;
    }
*/
