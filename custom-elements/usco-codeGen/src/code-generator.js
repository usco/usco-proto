function _isValidVector( vector )
{
  if(vector instanceof(THREE.Vector3)) //elimination of zero vectors
  {
    if(vector.equals(new THREE.Vector3()))
    {
      return false;
    }
    return true;
  }

  if(vector instanceof(THREE.Vector2)) //elimination of zero vectors
  {
    if(vector.equals(new THREE.Vector2()))
    {
      return false;
    }
    return true;
  }
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function uncapitalizeFirstLetter( str )
{
  return str.substr(0, 1).toLowerCase() + str.substr(1);
}


////////////

function CodeGenerator()
{
  this._lastTarget = null;
}

CodeGenerator.prototype.generateFromOperations=function(operations)
{
  this._lastTarget = null;
  this._visibleItems = []; //FIXME: kindof a hack: this list should contain leaf items only
  this._codeLength = 0;
  
  var collapsedOps = this.collapseOperations( operations );
  var code = this.generateCodeFromOperationsList( collapsedOps );
  
  return code;
}

/*Collapses a list of operation into an equal but reduced list:
Multiple translations in a row can be collapsed into a single one
Multiple rotations in a row can be collapsed into a single one
Multiple scalings in a row can be collapsed into a single one
*/
CodeGenerator.prototype.collapseOperations=function(operations)
{
  //TODO: add "hardcore/compact mode" that generates matrix operations instead of multiple translate/rotate/scale operations
  var collapsedHistory = [];
  var operation = null;
  var prevOperation = operation;
  
  /*if(operations === undefined || operations.length==0)
  { return collapsedHistory }*/

  for( var i=0; i<operations.length;i++)
  {
    var operation = operations[i].clone();
    //console.log("operation.value",operation.value);
    if(prevOperation != null && operation.type == prevOperation.type && operation.target == prevOperation.target && operation.value)
    {
      //console.log("type",operation.type, "value", operation.value.clone().add(prevOperation.value), "target", operation.target);
      //todo use correct operands ("add", "+" etc)
      if(operation.value instanceof(THREE.Vector3) || operation.value instanceof(THREE.Vector2))
      {
        //console.log("updating", prevOperation.value ,"with", operation.value);
        prevOperation.value.add( operation.value );
      }
      else if (operation.value instanceof(THREE.Euler) )
      {
        prevOperation.value.set( prevOperation.value.x+operation.value.x, prevOperation.value.y+operation.value.y, prevOperation.value.z+operation.value.z); 
      }
      else
      {
        prevOperation.value += operation.value;
      }
    }
    else
    {
      collapsedHistory.push( operation );
      prevOperation = operation;
    }
    
  }
  //console.log("original ops", operations);
  console.log("collapse ops", collapsedHistory);
  return collapsedHistory;
}


CodeGenerator.prototype.getOperationFormatedItemName=function(operation, attrName)
{
  if(attrName)
  { var attr = operation[attrName];
  }
  else
  {
    var attr = operation;
  }
  var itemName = attr.name.toLowerCase() || (attr.constructor.name.toLowerCase()  +new String(attr.id));
  
  itemName = toTitleCase( itemName );//Capitalize each char after space/tab
  itemName = itemName.replace(/ /g, '');//remove spaces/tabs
  itemName = uncapitalizeFirstLetter( itemName );
  return itemName;
}

CodeGenerator.prototype.getCurrentLine=function(code)
{
  return code.split("\n").length;
}

CodeGenerator.prototype.generateCodeFromOperation=function(operation, precision, targetFile, targetScope)
{
  var precision = precision || 2;
  var target = operation.target;
  var type = operation.type;
  var value = operation.value;

  //we apply the operations to the actual object, not its visual representation
  if(target.sourceElement) target = target.sourceElement;
  
  var targetName = this.getOperationFormatedItemName(operation, "target"); //(target.constructor.name.toLowerCase() || target.name.toLowerCase()) +new String(target.id);//    this.";//target.name;//@
  var code = "";
  var lineCap = ";\n";
  
  //we are working on a different object, add additional newline
  if(this._lastTarget != target && this._lastTarget != null)
  {
    code += "\n";
  }
  this._lastTarget = target;
  
  //TODO: if translate, rotate etc values are integers, do not display as float, or give the option to do so
  switch(type)
  {
    case "creation":
      var type = target.constructor.name || "foo";
      
      //TODO: refactor: this same code is present multiple times, and is clumsy
      var strValue = "";
      var paramsRaw = operation.target.properties;
      var params = {}
      for(key in paramsRaw)
      {
        var value = paramsRaw[key][2];
        params[key] = value;
      }
      //var params = operation.value
      if( Object.keys(params).length !== 0 )
      {
        var strValue = JSON.stringify(params);
        strValue.replace(/\\"/g,"\uFFFF"); //U+ FFFF
        strValue = strValue.replace(/\"([^"]+)\":/g,"$1:").replace(/\uFFFF/g,"\\\"");
      }
      
      //experimental
      var offset = this._codeLength + code.length;
      target.__meta.instancesData = [];
      var range = {range:[offset, 0]}
      
      console.log("here",range);
      //target.instancesData[0].range[0] = offset;
      code += "var "+targetName+" = new "+ type +"("+strValue+")"+lineCap;
      offset = this._codeLength + code.length;
      range["range"][1] = offset;
      target.__meta.instancesData.push(range);
      
      var parentName = "assembly";
      code += parentName+".add( "+ targetName +" )"+lineCap;

      
    break;
    case "deletion":
      //TODO: how to deal with this ?
    break;
    case "clone":
      var sourceName = this.getOperationFormatedItemName(operation, "source");
      code += "var " + targetName+"= "+sourceName+".clone()"+lineCap;
    break;
    case "import":
      var destinationName = this.getOperationFormatedItemName(operation, "value");
      code += "var " + destinationName+'= importGeom("'+targetName+'")'+lineCap;
    break;
    case "extrusion":
      var type = target.constructor.name || "foo";
      var sourceShapeName = this.getOperationFormatedItemName( operation, "sourceShape"  );
      var strValue = JSON.stringify(operation.value);
      strValue.replace(/\\"/g,"\uFFFF"); //U+ FFFF
      strValue = strValue.replace(/\"([^"]+)\":/g,"$1:").replace(/\uFFFF/g,"\\\"");
      code += "var "+targetName+" = "+ sourceShapeName +".extrude("+strValue+")"+lineCap;
    break;
    
    case "rotation":
      if (!("code" in target)){ target.code = ""};
      code += targetName+".rotate(["+ value.x.toFixed(precision)+","+value.y.toFixed(precision)+","+value.z.toFixed(precision)+"])"+lineCap;
    break;
    case "translation":
      if (!("code" in target)){ target.code = ""};
      if(target.name == "Shape2dPointHelper")
      {
        //console.log("we moved a shape2d helper",target.standInFor,target.sourceParent);
        var sourceParentName =this.getOperationFormatedItemName( operation, "sourceParent"  );
        var id = target.standInFor.index;
        code += sourceParentName+".controlPoints["+ id +"].translate(["+ value.x.toFixed(precision)+","+value.y.toFixed(precision)+",])"+lineCap;
      }
      else if(target.sourceShape)
      {
          var sourceShapeName = target.sourceShape.name.toLowerCase()+target.sourceShape.id;
          code += sourceShapeName+".translate(["+ value.x.toFixed(precision)+","+value.y.toFixed(precision)+","+value.z.toFixed(precision)+"])"+lineCap;
      }
      else
      {
      code += targetName+".translate(["+ value.x.toFixed(precision)+","+value.y.toFixed(precision)+","+value.z.toFixed(precision)+"])"+lineCap;
      }
    break;
    case "scaling":
      code += targetName+".Scale(["+ value.x.toFixed(precision)+","+value.y.toFixed(precision)+","+value.z.toFixed(precision)+"])"+lineCap;
    break;
    
    case "union":
      var resultName = this.getOperationFormatedItemName(operation, "result")
      var leftOpName = this.getOperationFormatedItemName(operation, "target")
      var ops =[];
      for(var i=0;i<operation.operands.length;i++)
      {
        var op = operation.operands[i];
        var opName = this.getOperationFormatedItemName(op);
        ops.push( opName );
      }
      code += "var " + resultName + "=" + targetName+".union(["+ops.join(",")+"])"+lineCap;
    break;
    case "subtraction":
      var resultName = this.getOperationFormatedItemName(operation, "result")
      var leftOpName = this.getOperationFormatedItemName(operation, "target")
      var ops =[];
      for(var i=0;i<operation.operands.length;i++)
      {
        var op = operation.operands[i];
        var opName = this.getOperationFormatedItemName(op);
        ops.push( opName );
      }
      code += "var " + resultName + "=" + targetName+".subtract(["+ops.join(",")+"])"+lineCap;
    break;
    case "intersection":
      var resultName = this.getOperationFormatedItemName(operation, "result")
      var leftOpName = this.getOperationFormatedItemName(operation, "target")
      var ops =[];
      for(var i=0;i<operation.operands.length;i++)
      {
        var op = operation.operands[i];
        var opName = this.getOperationFormatedItemName(op);
        ops.push( opName );
      }
      code += "var " + resultName + "=" +  targetName+".intersect(["+ops.join(",")+"])"+lineCap;
    break;
  }
  
  return code;
}

CodeGenerator.prototype.generateCodeFromOperationsList=function(operations)
{
  var code = "";
  for(var i = 0; i< operations.length;i++)
  {
    var operation = operations[i];
    code += this.generateCodeFromOperation(operation);
    this._codeLength += code.length;
  }
  //console.log("code:\n", code);
  return code;
}

CodeGenerator.prototype.createCustomPartClass=function( className, selections )
{
  //TODO: instead of re-evaling everything, should we not just create a new 
  //class and "inject" the existing instances "into it" ?
  
  var className = className || "CustomPart";
  var selections = selections || [];
  
  var subItemsCode = [];
  for(var i=0;i<selections.length;i++)
  {
    var selection = selections[i].sourceShape;
    var type = selection.constructor.name;//.toLowerCase()
    subItemsCode = this.generateCodeFromOperationsList( selection.operations );
    //transformedSelections.push("var foo"+i+" = new "+type+"();");
    //transformedSelections.push("foo"+i+".position.z =30;");
    //transformedSelections.push("this.add(foo"+i+");");
  }
  
  var rawClassText=[
  "function "+className+"(options)",
  "{" ,
  " options = options || {};",
  "  Part.call( this );",
  "}",
  className+".prototype = Object.create( Part.prototype );",
  className+".prototype.constructor = "+className+";",
  
  //not sure about "execute", but this is inspired by freecad python API
  //TODO: this is where all our current selections get added 
  className+".prototype.generate = function()",
  "{",
  subItemsCode,
   //transformedSelections.join("\n"), 
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


if(typeof module === "Object")
{
  module.exports.CodeGenerator =CodeGenerator;
}
