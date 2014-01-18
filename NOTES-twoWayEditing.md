
Logic (code <-> visual)
=======================

code -> visual
--------------
- "compile" code, generate object instance(s)
- finest grain (best level of control, more complex)

visual -> code
--------------
- based on user input (drag/translate objects, rotate them, scale them etc):
  * object INSTANCE attribute changes 
  * generate / MODIFY corresponding code
    * generation easier than rewrite
  * transformation stack/history can be "collapsed": ie when doing these operations manually
    
    translate([2,0,O])
    translate([0,3,0])
    
    same as (this is what you would write in code)
    
    translate([2,3,0])
  
  * operation order is important: translation , rotation scale order matters -> relatively trivial
  * how do we handle loops etc ? 


syntaxic analysis and alteration
================================

We need to know for a given "visual" ITEM (part, shape)
- where is the ITEM  defined
- where is the ITEM used
if the ITEM is used nowhere: do not recompile? 

if an item was added( to any object or main assembly), remove old instance, add new one
alternatively : generate a "wrapper" around created objects, only replace the innards ??

if an item has NO instance : do not recompile ??? 
  see : http://ariya.ofilabs.com/2012/11/polluting-and-unused-javascript-variables.html

very interesting read ( closely related):
https://code.google.com/p/esprima/issues/detail?can=2&q=90&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Summary&id=90

ALTERNATIVE SOLUTIONS:
---------------------
the problem is actually a SCOPE problem: 
if you are editing a PART (within it) you are in the SCOPE of that part : ie we can disregard
the rest of the code until editing it done

we can draw a parallel to visual editing: 
  - double clicking on a part/shape would go into an edit mode where all other elements are grayed out,
  and we are in the local coordinate system of the element being edited

classes and instances:
---------------------
it is important to make a distinction between classes (or functions etc) and their instances

Instance differentiation:
 - instances can be differentiated based on a hash generated from their input parameters (
similarly to how the bom system handles it in the current implementation)
  - depending on instance size (very variable based on geometric back end) 

code analysis tools:
====================
-esprima !:
 http://esprima.org/index.html

- escope (scope analysis)
  https://github.com/Constellation/escope

- esrefactor (alter code)
  https://github.com/ariya/esrefactor

- falafel (alter code) https://github.com/substack/node-falafel

- esgraph visualization https://github.com/Swatinem/esgraph

2 main problems to resolve (seperate but tangentially related)
-------------------------
- bidirectional shape edition
- code compilation optimisation (do not recompile everything when
 only an independant subset has changes)


additional issues
=================
- coffeescript : are sourcemaps sufficient to get a precise level of control ?
- intermediary coffee-> js step : could be circumvented with coffeescript-redux, but that 
still lacks support for super() (!!!!!)

