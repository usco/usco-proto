
Example cases need to :
 - showcase independant recompiling of unrelated pieces of code (no dependencies)
 - showcase different shapes
 - showcase part hierarchy & assembly
 - showcase variations of single part
 - showcase connectors
 - showcase swappable parts
 - showcase printed & non printed parts (bom)
 - showcase exploded view
 - showcase assembly instructions
 

simple robot
============
- roughly based on mini skybot (http://www.iearobotics.com/wiki/index.php?title=Mini-Skybot)

Parts
-----
  Printed
  -------
  - big wheel (X2) -> variations
  - rear wheel (X1)
  - chassis (X1)
  - battery holder(X1)

  Not-printed
  -----------
  - servo moto (X2)
  - ultrasound sensor (X1)
  - electronics (X1)
  - batteries (X4)
  - nuts and bolts (???)


independant recompile
=====================
- working on big wheels:
  2 instances        -> get changed
  small wheel        -> does not get recompiled
  chassis            -> does not get recompiled
  battery holder     -> does not get recompiled
  
1- first basic example to implement
  - 2 big wheels
  - chassis
