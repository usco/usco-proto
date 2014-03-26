

function createCustomPartClass( className, selections )
{
  var className = className || "CustomPart";
  var selections = selections || [];
  
  var transformedSelections = [];
  for(var i=0;i<selections.length;i++)
  {
    var selection = selections[i].sourceShape;
    var type = selection.constructor.name;//.toLowerCase()
    transformedSelections.push("var foo"+i+" = new "+type+"();");
    transformedSelections.push("foo"+i+".position.z =30;");
    transformedSelections.push("this.add(foo"+i+");");
  }
  
  var rawClassText=[
  "function "+className+"(options)",
  "{" ,
  " options = options || {};",
  "  Part.call( this );",
  "  this.name = '"+className+"'+this.id;",
  "  this.blabla = 24;",
  "}",
  className+".prototype = Object.create( Part.prototype );",
  className+".prototype.constructor = "+className+";",
  
  //not sure about "execute", but this is inspired by freecad python API
  //TODO: this is where all our current selections get added 
  className+".prototype.generate = function()",
  "{",
   transformedSelections.join("\n"), 
  "}",
  "return "+className+";"
  ]
  

  rawClassText = rawClassText.join("\n");
  console.log("rawClassText:\n\n",rawClassText);
  
  args = "";
  //var newClass = eval( rawClassText );
  var newClass = new Function(rawClassText)();
  //console.log("newClass", newClass);
  console.log("custom class:\n", newClass);
  return newClass;

}
