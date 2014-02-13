  visualFocusOnSelection : function(selection)
  {
    //visual helper: make object other than main selection slightly transparent
      //console.log("this.rootAssembly.children",this.renderer)
      for(var i = 0; i < this.rootAssembly.children.length;i++)
      {
        var child = this.rootAssembly.children[i];
        if(selection == child)
        {
          child.material.opacity = child.material._oldOpacity;
          child.material.transparent = child.material._oldTransparent;
          //child.renderDepth = child.material._oldRenderDepth;
          /*child.material.renderDepth = 1e20;
          child.material.depthTest=false;
          child.material.depthWrite=false
          child.renderDepth = 1e20;*/
        
          continue;
        }
        child.material._oldOpacity = child.material.opacity;
        child.material._oldTransparent = child.material.transparent;
        child.oldRenderDepth = child.renderDepth;
    
        //child.renderDepth = 0;
        //child.material.renderDepth = 0;
        child.material.opacity = 0.3;
        child.material.transparent = true;
        
      }
  },
  //TODO: move this somewhere else, preferably a helper
  clearVisualFocusOnSelection : function()
  {
      for(var i = 0; i < this.rootAssembly.children.length;i++)
      {
        var child = this.rootAssembly.children[i];
        child.material.opacity = child.material._oldOpacity;
        child.material.transparent = child.material._oldTransparent;
        //child.renderDepth = child.material._oldRenderDepth;
      }
  },
