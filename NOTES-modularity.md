
ui notes
========

heavy use of polymer elements 

ui
=======================
- fix issues with polymer wrappers of ace and/or codemirror:
  - ace crashed on scroll upwards
  - codemirror is incomplete


- need :
  * tabbed code editor with two-way databinnding
  * shape creation ui
    * 3d
    * 2d
  * improve hover/selection effects in 3d view : stack of effect to push/pop
  * rethink hover/selection of objects in 3d view : if hovering over SUB elements of a parent wrapper
object the hovered object/ selected object should be the outermost parent in scope ie
 
rootAssembly --> scope is here
  -> part (name:foo) 
    -> part (name:bar)
           -> shape * THIS should hover/select foo
           -> shape * THIS should hover/select foo

rootAssembly 
  -> part (name:foo) --> scope is here (ie editing foo)
    -> part (name:bar)
           -> shape * THIS should hover/select bar
           -> shape * THIS should hover/select bar

rootAssembly
  -> part (name:foo) 
    -> part (name:bar) --> scope is here (ie editing bar)
           -> shape * THIS should hover/select the shape
           -> shape * THIS should hover/select the shape

composition > inheritance
=========================

Structuring the app modularly using the power of polymer (see usco/polymer-threejs as an example of this):
  <usco-app>
    <usco-kernel>
      <stores>
        <usco-xhrstore></usco-xhrstore>
        <usco-localstore> </usco-localstore>
        <usco-hddstore> </usco-hddstore>
        <usco-dropboxstore> </usco-dropboxstore>
      </stores>
      <parsers>
        <usco-stl-parser></usco-stl-parser>
        <usco-amf-parser></usco-amf-parser>
        <usco-ctm-parser></usco-ctm-parser>
        <usco-obj-parser></usco-obj-parser>
        <usco-ply-parser></usco-ply-parser>
      </parsers>
      <writers>
        <usco-bom-writer></usco-bom-writer>
        <usco-stl-writer></usco-stl-writer>
        <usco-amf-writer></usco-amf-writer>  
      </writers>
      <usco-asset-manager> </usco-asset-manager>
    </usco-kernel> 
  </usco-app>
