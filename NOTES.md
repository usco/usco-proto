
Logic (code <-> visual)
=======================

We need to know for a given "visual" ITEM (part, shape)
- where is the ITEM  defined
- where is the ITEM used
if the ITEM is used nowhere: do not recompile? 


code analysis tools:
====================
-esprima !:
 http://esprima.org/index.html

- escope (scope analysis)
  https://github.com/Constellation/escope

- esrefactor (alter code)
  https://github.com/ariya/esrefactor


ui
=======================
- fix issues with polymer wrappers of ace and/or codemirror:
  - ace crashed on scroll upwards
  - codemirror is incomplete