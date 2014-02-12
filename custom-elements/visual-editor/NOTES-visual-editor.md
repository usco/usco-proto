

TODO:
====
- hiearchical editing (goint "INTO" an object)
- cloning()
- linked cloning : geometry/shape/structure stays the same, but the new instance is a different node in the scene graph
  Two methods are possible :
    * keeping a single instance of the geometry/shape common to all instances: this is problematic because of three.js
 inability to swap out the contents of a geometry : you can alter the contents of the buffers, not resize them, which means
going through some sort of wrapper around the geometry (problematic, as far as my experiments have shown).
      Advantages: 
        * normally should be simple (no duplication, single geometry instance etc)
        * bi-directional (wherever the geometry is changed does not matter)
      Issues:
        * hard to get working (not there yet !)
        * how to handle mirroring etc ? or anything that should only be applied to a specific instance?

    * even dispatching: whenever the original changes, copies should as well)
      Advantages:
        * works !
        * less cumbersome workaround around limitations of three.js
      Issues:
        * only one sided (only original -> linked copy)

- improved visuals for meshes : litsphere can be a good "neutral" (not too dependant on lighting,
no dark areas) way of drawing meshes : see here for example : http://www.clicktorelease.com/code/spherical-normal-mapping/#

- more generic drag & drop support : should re-fire event so outer elements/pages can hook up to it( file upload ?)
- find a way to determine surface normal under mouse, to "glue" objects, with correct up vector , at the specified point/surface
- find a way to "snap" to elements (notably, connectors):
   * that might be a bit harder than expected: in order to do this, we need to search for "nearby" (close to mouse's 3d position)
   elements (connectors), which means storing the available connectors in a given scope (or perhaps use THREE.octree)


How to deal with:
- issue with lack of ability to swap out geometry with another one in three.js meshes:
 * do we need a "neutral wrapper" that does not directly contain geometry ?
- undo/redo of boolean operations :
 * store full geometry of object like it was before/after operations ? ->
could be very memory hungry
 * store diff/insersect etc and re apply a reversed boolean operation ? -> could be cpu hungry!




Additional notes:
-----------------
Some bad "suprises" regarding THREE.js:
 * mesh mirroring support is bad / unexisting:
   * applying matrix to mesh does not apply it to geometry (flipping positions in scene graph, but not geometry)
   * applying matrix to geometry foobars normals/winding order and needs hacks/workarounds
