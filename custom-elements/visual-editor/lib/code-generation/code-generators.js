function collapseOperations(operations)
{
  //TODO: add "hardcore/compact mode" that generates matrix operations instead of multiple translate/rotate/scale operations
  if(operations === undefined || operations.length==0)
  { throw new Error("No valid list of operations given");}

  var collapsedHistory = [];
  var operation = null;
  var prevOperation = operation;

  for( var i=0; i<operations.length;i++)
  {
    var operation = operations[i].clone();
    console.log("operation.value",operation.value);
    if(prevOperation != null && operation.type == prevOperation.type && operation.target == prevOperation.target && operation.value)
    {
      //console.log("type",operation.type, "value", operation.value.clone().add(prevOperation.value), "target", operation.target);
      //todo use correct operands ("add", "+" etc)
      if(operation.value instanceof(THREE.Vector3) || operation.value instanceof(THREE.Vector2))
      {
        console.log("updating", prevOperation.value ,"with", operation.value);
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

function generateCodeFromOperation(operation, precision, targetFile, targetScope)
{
  var precision = precision || 2;
  var target = operation.target;
  var type = operation.type;
  var value = operation.value;

  var targetName = target.name.toLowerCase()+new String(target.id);//    this.";//target.name;//@
  var code = "";
  var lineCap = ";\n";
  //TODO: if translate, rotate etc values are integers, do not display as float, or give the option to do so
  switch(type)
  {
    case "creation":
      var type = target.constructor.name || "foo";
      code += "var "+targetName+" = new "+ type +"()"+lineCap+"\n";
    break;
    case "deletion":
      //TODO: how to deal with this ?
    break;
    case "extrusion":
      console.log("extrusio", operation);
      var type = target.constructor.name || "foo";
      var sourceShapeName = operation.sourceShape.name.toLowerCase()+new String(operation.sourceShape.id);
      var strValue = JSON.stringify(operation.value);
      strValue.replace(/\\"/g,"\uFFFF"); //U+ FFFF
      strValue = strValue.replace(/\"([^"]+)\":/g,"$1:").replace(/\uFFFF/g,"\\\"");
      code += "var "+targetName+" = "+ sourceShapeName +".extrude("+strValue+")"+lineCap+"\n";
    break;
    
    case "rotation":
      if (!("code" in target)){ target.code = ""};
      code += targetName+".rotate("+ value.x.toFixed(precision)+","+value.y.toFixed(precision)+","+value.z.toFixed(precision)+")"+lineCap;
    break;
    case "translation":
      if (!("code" in target)){ target.code = ""};
      code += targetName+".translate("+ value.x.toFixed(precision)+","+value.y.toFixed(precision)+","+value.z.toFixed(precision)+")"+lineCap;
    break;
    case "scaling":
      if (!("code" in target)){ target.code = ""};
      code += targetName+".scale("+ value.x.toFixed(precision)+","+value.y.toFixed(precision)+","+value.z.toFixed(precision)+")"+lineCap;
    break;
    
    case "union":
      var ops =[];
      for(var i=0;i<operation.operands.length;i++)
      {
        var op = operation.operands[i];
        var opName = op.name.toLowerCase()+new String(op.id);
        ops.push( opName );
      }
      code += targetName+".union(["+ops.join(",")+"])"+lineCap;
    break;
    case "subtraction":
      var ops =[];
      for(var i=0;i<operation.operands.length;i++)
      {
        var op = operation.operands[i];
        var opName = op.name.toLowerCase()+new String(op.id);
        ops.push( opName );
      }
      code += targetName+".subtract(["+ops.join(",")+"])"+lineCap;
    break;
    case "intersection":
      var ops =[];
      for(var i=0;i<operation.operands.length;i++)
      {
        var op = operation.operands[i];
        var opName = op.name.toLowerCase()+new String(op.id);
        ops.push( opName );
      }
      code += targetName+".intersect(["+ops.join(",")+"])"+lineCap;
    break;
  }
  return code;
  //target.code = code;
}

function generateCodeFromOperations(operations)
{
  var code = "";
  for(var i = 0; i< operations.length;i++)
  {
    var operation = operations[i];
      code+=generateCodeFromOperation(operation);
  }
  console.log("code:\n", code);
  return code;
}

if(typeof module === "Object")
{
  module.exports.generateCodeFromOperations =generateCodeFromOperations;
  module.exports.generateCodeFromOperation = generateCodeFromOperation;
  module.exports.collapseOperations = collapseOperations;
}
