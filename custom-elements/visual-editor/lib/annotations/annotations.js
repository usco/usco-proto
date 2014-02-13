addAnnotation:function(event, detail, sender)
{
  console.log("i want to add annotation");
  var x = event.impl.offsetX;
  var y = event.impl.offsetY;
  this.selectionHelper.pick(x,y);
}

