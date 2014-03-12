THREE.TextDrawHelper = function () {
  THREE.Object3D.call( this );
}

THREE.TextDrawHelper.prototype = Object.create( THREE.Object3D.prototype );


THREE.TextDrawHelper.prototype.drawText = function(text, displaySize, background, scale) {
  var borderThickness, canvas, context, fontSize, metrics, rect, sprite, spriteMaterial, textWidth, texture;
  fontSize = displaySize || 18;
  background = background || false;
  scale = scale || 1.0;
  canvas = document.createElement('canvas');
  borderThickness = 2;
  context = canvas.getContext('2d');
  context.font = fontSize+"px sans-serif";
  context.textAlign = 'center';
  context.fillStyle = this.textColor;
  context.fillStyle = "rgba(0, 0, 0, 1.0)";
  context.strokeStyle = "rgba(0,0,0,1.0)";

  rect = function(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    return ctx.stroke();
  };
  if (background) {
    metrics = context.measureText(text);
    textWidth = metrics.width;
    context.fillStyle = "rgba(255, 255, 255, 0.55)";
    context.strokeStyle = "rgba(255,255,255,0.55)";
    rect(context, canvas.width / 2 - fontSize, canvas.height / 2 - fontSize, textWidth + borderThickness, fontSize * 1.4 + borderThickness, 6);
  }
  //context.strokeStyle = this.textColor;
  context.strokeText(text, canvas.width / 2, canvas.height / 2);
  context.fillText(text, canvas.width / 2, canvas.height / 2);


  texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.3,
    useScreenCoordinates: false,
    scaleByViewport: false,
    color: 0xffffff,
    side : THREE.DoubleSide,
    depthTest:false,
    depthWrite:false,
    renderDepth : 1e20
  });
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;

  sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(100 * scale, 50 * scale, 1.0);
  return sprite;
};

THREE.TextDrawHelper.prototype.drawTextOnPlane = function(text, fontSize) {
  var canvas, context, material, plane, texture, size;
  size = 256;
  
  var fontSize = fontSize || 18;
  canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  context = canvas.getContext('2d');
  context.font = fontSize+"px sans-serif";
  context.textAlign = 'center';
  context.fillStyle = this.textColor;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  context.strokeStyle = this.textColor;
  context.strokeText(text, canvas.width / 2, canvas.height / 2);
  texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.generateMipmaps = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    color: 0xffffff,
    alphaTest: 0.2,
    side : THREE.DoubleSide,
    depthTest:false,
    depthWrite:false,
    renderDepth : 1e20
  });
  plane = new THREE.Mesh(new THREE.PlaneGeometry(size / 8, size / 8), material);
  plane.overdraw = true;
  plane.renderDepth =1e20;
  return plane;
};
