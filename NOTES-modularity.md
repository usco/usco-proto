  
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
