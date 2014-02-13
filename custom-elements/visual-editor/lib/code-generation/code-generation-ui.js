


/*
@param selection : selected object instance
@param history : list of operations/commands
*/
function updateSelectionCode(selection, history)
{
  if(!(selection)) return;
  console.log("generating");
  var generatedCode={};
  var collapsedOps = collapseOperations( history,  selection);
  //console.log("collapsedOperations", collapsedOps);
  
  selection.code = "class "+selection.name+ " extends Part\n  constructor:(params)->\n    super(params)\n    @name='"+selection.name+"'\n";
  selection.code += "   makeGeometry:->\n"
  generateCodeFromOperations( collapsedOps );
  /*for(var i=0;i<collapsedOps.length;i++)
  {
    generateCodeFromOperation(collapsedOps[i]);
  }*/
  //console.log("selection.code",selection.code);

}

