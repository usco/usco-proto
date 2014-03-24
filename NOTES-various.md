Node webkit (thus desktop) will need a different way of handling file saves/loads
This should be taken into account in the seperation of concerns ( we already have parser/serialisers 
and serializers are not writers so we seem to be good)

- full ui (standalone) would wrap:
  kernel
  visual editor
  code editor
  * provide itw own ui elements : menus etc

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
    

Multi level editing
===================
   
   
