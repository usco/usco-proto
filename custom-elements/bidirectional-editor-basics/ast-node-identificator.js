function ASTNodeIdentificator()
{

}

//NODE Identification methods : TODO: expand on this
//TODO : seperate filling data (classes, function, instances) from determining if a node is of a given type
ASTNodeIdentificator.prototype._isNodeAVariableDeclaration = function(node, classes)
{
  if(node.type == 'VariableDeclarator' && node.init && node.init.callee && (node.init.callee.name in classes))
  {
    return true;
  }
  return false;
}

ASTNodeIdentificator.prototype._isNodeAVariableAsignment = function(node, classes)
{
  if(node.type == 'ExpressionStatement' && node.expression)
  {
    var expression = node.expression;
    if(expression.type == "AssignmentExpression" && expression.operator === '=' && expression.left.type == "Identifier")
    {
        if(expression.left.name in classes)
        {
          console.log("asignement to class");
          return true;
        }
    }
  } 
  return false;
}


ASTNodeIdentificator.prototype._isNodeAFunctionDeclaration = function(node)
{
  if (node.type == 'FunctionExpression' || node.type == 'FunctionDeclaration')
  {
    if(node.id !== null && node.id !== undefined )
    {
      return true;
    }
  }
  return false;
}

ASTNodeIdentificator.prototype._addNodeToFunctions = function(node, functions)
{
    var name = node.id.name;
    functions[name] = {range:node.range};
    //console.log("function",name, "range", node.range, "node",node);
}

ASTNodeIdentificator.prototype._addNodeToClasses = function(node, functions, classes)
{
   var className = node.left.object.name;
   classes[className]={range:functions[className].range};
}

ASTNodeIdentificator.prototype._isNodeAClassDeclaration = function(node, functions)
{
  if(node.type=='AssignmentExpression' && node.operator === '='  )
  { 
    //console.log("asignment", node.right.arguments, node);
    //"class detection"
    if(node.left.object && node.left.object.name && node.right.arguments && node.right.arguments.length >0 && node.right.arguments[0].property && node.right.arguments[0].property.name)
    {
      var className = node.left.object.name;
      var isValid = node.right.type == "CallExpression" && node.right.arguments[0].property && node.right.arguments[0].property.name =="prototype"

      if( className in functions && node.left.property.name === "prototype" && isValid)
      {
        return true;
      }
    }
  }
  return false;
}
