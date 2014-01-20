class Part extends THREE.Mesh
  constructor:->
    THREE.Mesh.call(@, undefined, new THREE.MeshNormalMaterial())
    @_reflexed = null

class Cube extends Part
  constructor:(w,h,d)->
    super()
    @w = w or 50
    @h = h or 50
    @d = d or 50

    @geometry = new THREE.CubeGeometry( @w, @d, @h )


cube = new Cube()
cube.name="testCube"

cube2 = new Cube()
cube2.name="testCube2"
cube2.position.x = -60

assembly.add(cube)
assembly.add(cube2)
