
STOP recompiling everything if only an little , independant part was changed
MATHS library needs to be a lot more complete (see three.js)
CONSOLE/error output is very bad, useability wise
CODE editor ui resizing etc is not practical
HOW TO handle multiple KNOWN variations of a PART (nuts, bolts, bla bla)
DOCUMENTATION !! FULL api docs is a MUST

INTICE seperating parameters/properties definition from shape generation : see "generate" method & generateAtConstruct flag
PERHAPS one shape -> one module forcefully

ALLOW "linking" of variables :ex:


    @defaults = {
      width: 20,
      depth: 20
      height:30
      centerHole:false
      hsToShow:[true,true,true,true]
      hsHeights:[height,height,height,height] ---> THIS WOULD NOT WORK
    }
    
LOCAL FS support ! linked to item below 
GIT SUPPORT ! 
DESKTOP support!
PUBLISH: 
  * static: youmagine, thingiverse etc
  * dynamic , sliders etc : embed , link (need to bring instance code along, precompiled + attributeChanged)
  * dynamic, fully editable : embed, open a clone() (git) in local instance or desktop
      
TESTING framework : (server side) : take the ranges of all parameters of a given shape/module : generate all possible variations,
validate resulting geometry

OPTIONS parsing api need to be accessible to users
EXPORT to common formats SHOULD ALWAYS WORK !! dammit !: FixTJunctions issues etc : should be optional
EDITING : a LOT more often than exporting a triangulated mesh : we NEED a fast (real time) gpu based csg running in webgl!
  * best of both worlds : real time visualization using GPU
  * background worker generating triangulated meshes, so export does not take ages

DIMENTIONS : would need to be able hook into the "dynamic" system : could represent visual , some of the key attributes of a parametric design
