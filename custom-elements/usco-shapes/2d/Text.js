//TODO: find a way to make this work
//TODO: how to deal with multiple shapes in one , like with text?

function Text(options)
{
    var options = options || {};
    var text = this.text = options.text || "foo";//"\uf001";
    var size = this.size = options.size || 20;
    var font = this.font = options.font || "helvetiker";//"fontawesome";
    var weight = this.weight = options.weight || "";
    
    if(font == "fontawesome")
    {
      text = unescape('%u' + text);
    }
    console.log("options", options, font, size, text);
    
    var textShapes = THREE.FontUtils.generateShapes( text, {font:font,size:size} );
    console.log("textShapes", textShapes);
    
    Shape2d.call( this );
    
    for(var i=0;i<textShapes.length;i++)
    {
        this.fromThreeShape( textShapes[i] );
    }

    //console.log("my actions", textShapes[0].actions, this.actions);
    //console.log("my curves", textShapes[0].curves, this.curves);
    
    for(var i=0;i<textShapes[0].holes;i++)
    {
      this.holes.push( textShapes[0].holes[i] );
    }
    //console.log("text", this);
    
    this.properties["text"] = ["text", "Actual text", "foo"]
    this.properties["size"] = ["size", "font size",20]
    this.properties["font"] = ["font", "font type","helvetiker"]
}
Text.prototype = Object.create( Shape2d.prototype );
Text.prototype.constructor = Text;

Text.prototype.attributeChanged=function( attrName, newValue, oldValue)
{
  console.log("text's attribute changed", attrName, newValue, oldValue);
  
  this[attrName] = newValue;
  this.properties[attrName][2] = newValue;
  if(this.font == "fontawesome")
  {
    this.text = unescape('%u' + this.text);
  }
  console.log("text", this.text);

  //TODO: only do this if something changed!
  this.actions = [];
  this.curves = [];
  this.controlPoints = [];
  this.__visualContols = [];
  
  var textShapes = THREE.FontUtils.generateShapes( this.text, {font:this.font,size:this.size} );
  for(var i=0;i<textShapes.length;i++)
  {
      this.fromThreeShape( textShapes[i] );
  }
  this.updateRenderables();
}


Text.prototype.update=function( parameters )
{
  for(var i=0;i< this.renderable.children.length;i++)
  {
    var child = this.renderable.children[i];
    this.renderable.remove( child );
  }
  
  Shape2d.prototype.update.call(this, parameters);
  
  if(this.font == "fontawesome")
  {
    this.text = unescape('%u' + this.text);
  }
  
  //TODO: only do this if something changed!
  this.actions = [];
  this.curves = [];
  this.controlPoints = [];
  this.__visualContols = [];
  
  var textShapes = THREE.FontUtils.generateShapes( this.text, {font:this.font,size:this.size} );
  for(var i=0;i<textShapes.length;i++)
  {
      this.fromThreeShape( textShapes[i] );
  }
  this.generateVisualControlPoints();
  
  Shape2d.prototype.update.call(this, parameters);
}


//FIXME! HAAACK ! not even 2d
/*Text = function ( options ) {

  var options = options || {};
    var text = options.text || "foo";//"\uf001";
    var size = options.size || 20;
    var font = options.font || "helvetiker";//"fontawesome";
    var weight = options.weight || "";
    
    
	textGeo = new THREE.TextGeometry( text, {
          font:font,
					size: size,
					height: 10,
					material: 0,
					extrudeMaterial: 1
				});
	Part.call( this );
	this.geometry = textGeo;
};

Text.prototype = Object.create( Part.prototype );
Text.prototype.constructor = Text;*/

