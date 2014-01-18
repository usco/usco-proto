
Logic (code <-> visual)
=======================

We need to know for a given "visual" ITEM (part, shape)
- where is the ITEM  defined
- where is the ITEM used
if the ITEM is used nowhere: do not recompile? 


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

code analysis tools:
====================
-esprima !:
 http://esprima.org/index.html

- escope (scope analysis)
  https://github.com/Constellation/escope

- esrefactor (alter code)
  https://github.com/ariya/esrefactor

2 main problems to resolve (seperate but tangentially related)
-------------------------
- bidirectional shape edition
- code compilation optimisation (do not recompile everything when
 only an independant subset has changes)


ui
=======================
- fix issues with polymer wrappers of ace and/or codemirror:
  - ace crashed on scroll upwards
  - codemirror is incomplete
