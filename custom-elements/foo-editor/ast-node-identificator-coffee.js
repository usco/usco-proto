function ASTNodeIdentificatorCoffee()
{

}

//NODE Identification methods : TODO: expand on this
//TODO : seperate filling data (classes, function, instances) from determining if a node is of a given type
ASTNodeIdentificatorCoffee.prototype._isNodeAVariableDeclaration = function(node, classes)
{
  if(node.type == 'VariableDeclarator')
  {
    if(node.init && node.init.callee && (node.init.callee.name in classes) )
    {
      return true;
    }
  }
  return false;
}

ASTNodeIdentificatorCoffee.prototype._isNodeAVariableAsignment = function(node, classes)
{
  if(node.type == 'ExpressionStatement' && node.expression)
  {
    var expression = node.expression;
    if(expression.type == "AssignmentExpression" && expression.operator === '=' && expression.left.type == "Identifier")
    {
      console.log("poop");
      console.log("right", expression.right)
        if(expression.right.callee && expression.right.callee.name in classes)
        {
          console.log("asignement to class");
          return true;
        }
    }
  } 
  return false;
}


ASTNodeIdentificatorCoffee.prototype._isNodeAFunctionDeclaration = function(node)
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

ASTNodeIdentificatorCoffee.prototype._addNodeToFunctions = function(node, functions)
{
    var name = node.id.name;
    functions[name] = {range:node.range};
    //console.log("function",name, "range", node.range, "node",node);
}


ASTNodeIdentificatorCoffee.prototype._addNodeToClasses = function(node, functions, classes)
{
   var className = node.left.name;
   classes[className]={range:node.range};
}


ASTNodeIdentificatorCoffee.prototype._isNodeAClassDeclaration = function(node, functions, classes)
{
  if(node.type=='AssignmentExpression' && node.operator === '='  )
  { 
    console.log("class detection attempt, from COFFEE", node.right.arguments, node);
    //"class detection"
    if(node.left.name)
    { 
      var className = node.left.name;
      console.log("className", className);
    
      try{
        //TODO: do this better
        if(node.right.type == "CallExpression" )
        {
          try{
          var isSimpleClass = node.right.callee.body.body[0].type=="FunctionDeclaration" && node.right.callee.body.body[0].id.name == className;

          console.log("FOUND className!", className);
          return true;
          
          }catch(error){}
          console.log("lmmlk");
          try{
          console.log("klmk");
          var isExtendClass = node.right.callee.body.body[1].type=="FunctionDeclaration" && node.right.callee.body.body[1].id.name == className;
          console.log("FOUND className!", className);
          return true;
          }catch(error){}

          return false;
        }
         

       }
       catch(error)
        {
        return false;
        }
    }
  }
  return false;
}
