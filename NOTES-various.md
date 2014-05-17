variants and features
=====================

- full ui (standalone) would wrap:
  * kernel
  * visual editor
  * code editor
  * params editor
  * design browser/dashboard
  
  This is the default, standard version
  * provide its own ui elements : menus etc
  * full feature set

- embedable version would wrap:
  * kernel
  * viewer 
  * params editor (sliders, ticks etc)
  (* design browser/dashboard : perhaps a trimmed down version, specific to user's designs?)
  
  this version could be used by users to embed/showcase their 
  designs on their webpage for example. 
  It would have full view controls (grid, autorotate, camera angles)
  It would not have full editing capabilities
  It would not allow you to save/load your designs (need UI to match)
  It would allow you to fork the design
  
  
 - integrated (viewer) would wrap:
  kernel
  viewer (!!)
 
 - integrated (editor) would wrap
  kernel
  visual editor
  code editor
  
- communication via messaging
  - "request" events : 
      * requestMeshExport
      * requestDesignSave
      * requestDesignLoad
      
      * reqShapeOperation(??)
  - various events: newOperation

Node webkit (thus desktop) will need a different way of handling file saves/loads
This should be taken into account in the seperation of concerns ( we already have parser/serialisers 
and serializers are not writers so we seem to be good)


Various/utilities:
==================
- three.js utility to convert local coords of an object to local coords of another object:
  ie : the objects parent changes, its world position DOES NOT


SHAPES:
=======
-mathematical representation, frep etc:
 * default "resolution" parameters should be "pseudo infinite":
  - this would perhaps provide compatibility with more mathematical representation
  of shapes vs polygonal ones : ie not resolution means "as high precision as the 
  system will allow"
 * formalize parameter/attribute aliases:
  - example : radius & diameter -> actually the same thing
  - getters setters and a "strong" and "weak" one if they are both defined ?

CUSTOMIZERS, on screen controls:
================================

- we need:
  * text
  * number (simple)
  * number (range : ie if min, max, step are specified)
  * boolean (checkbox)
  * select (if a list is specified for the value param ?)
  * color (erm ??)
  * fieldsets support

  
OVERALL LOGIC NOTES:
====================
- current editing level/ scope : CES

- at a given level: root, or within a class definition
   * all operations (translate, rotate, scale) of N+1 items are recorded at the given level
   * all undo redo of those operations also happen at that level
   * operation manager needs to "hook" into the operations of a specific level container (trivial)
   * TODO: we must be sure that there are no possible "traps"/gaps in this logic

- turning selections into classes/ templates:
  * one ore more selected shapes/parts can be turned into a class
  * need an on screen "editor" where you can set the following:
    * name of new class
    * list of parameters, their names and values
  * overall "naive" algorithm
    * we create the boilerplate structure for our new class (see ClassDeclaration, esprima , js new Function() etc)
    * we add all our current selections (and their transform histories !) to the new classe
    * we REMOVE all the selectedObjects from our CURRENT editing scope (CES)
    * we INSTANCIATE an instance of the new class 
    * we add it to our CES
    
  * note: how de we prevent endless creation of templates from selections : ie
    * select an object, templatize it
    * select the new class/template, templatize it
    * select the new class/template, templatize it ...ETC
   
Transform history
=================
- always relative to the current  selection level / CES:
- I repeat: every transform :translate, rotate, scale, relative to its parent
  * we cannot store operations within the shape that gets transformed because it does not preserve the order
  within the scope
- needs to work both for compilation from code and visual
  * for visual, in truth , only the current selection(s) can signal "new operations" (translate,
rotate, scale) 
  * perhaps if we use polymer's utilities /object.observe, we need to compound multiple consecutive changes
(ie if you drag an object around, there are lots of changes, but only one compound interesting one) 

- DANG ! very important: we also need to be able to go into the construction "graph" of an object:
  * ie if a sphape is a cube subtract sphere , at the top level we only have the result, but we need
  to get "into" that composite
  * perhaps add notion of dedicated classes for that ? ie Substraction (notice uppercase) 
  
Multi level editing
===================
2D shapes:
 - a shape is made of 1..n paths 
 - a shape can have boolean operations
 - a shape can be extruded 
 - currently a shape is made of polygons
 
Important modeling methods to have:
===================================
- hull 
 * 2d 
 * 3d
- minkowski

chain hull

Various representations, one object:
====================================
- abstract (in memory instance)
- code
- visual
How to synchronize these?
   
About operations
================
- like russian dolls or a graph?
- embeded inside objects or not ?
- ast nodes or not?
- parallels:
  * creation : VariableDeclaration (declarator + NewExpression)
  * deletion : none : it is a kind of no-op: if a shape is delete, it is the same as not being added to a parent container
  * clone : VariableDeclaration( declator + HIDDEN NewExpression + assignments)
  
CLI
===
- generating ouput data structures after compiling (ie stl, amf etc) : => ok, easy
- generating output images after compiling:
  * requires jsdom, node-three.js , server side rendering
  * how to handle dom/css labels (css renderer etc)
  * how to handle polymer elements
  
 Code:
 =====
  - custom keyword in front of class/ instance whatever definition which tells the compiler NOT
  to recompile that part ?
  - how to deal with partial changes?
  - generate "logic/hierarchy" tree from code withouth compiling to know which Part is used where?
  (dependencies tracking)
   
 Other:
 ======
 - root nodes/ primitive (applicable in a lot of cases):
  * base shapes : cube, cylinder etc
  * imported geometry : stl, obj, ply etc (amf)
