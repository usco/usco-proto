

TODO:
====
- hiearchical editing (goint "INTO" an object)
- cloning()
- linked cloning (geometry stays the same)
- improved visuals for meshes : litsphere can be a good "neutral" (not too dependant on lighting,
no dark areas) way of drawing meshes : see here for example : http://www.clicktorelease.com/code/spherical-normal-mapping/#

How to deal with:
- issue with lack of ability to swap out geometry with another one in three.js meshes:
 * do we need a "neutral wrapper" that does not directly contain geometry ?
- undo/redo of boolean operations :
 * store full geometry of object like it was before/after operations ? ->
could be very memory hungry
 * store diff/insersect etc and re apply a reversed boolean operation ? -> could be cpu hungry!

