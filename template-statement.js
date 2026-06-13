/* template-statement.js — one big centered idea. Adaptive: text auto-sizes to length. */
OWOF.registerTemplate({
  type:"statement", label:"Statement (big idea)",
  defaults:function(){ return {type:"statement", text:"One bold idea, stated simply.", attribAbove:"", attribBelow:""}; },
  editor:function(s,host,H){
    const fs=H.fieldset("Statement");
    fs.appendChild(H.fld("Small line above (optional)", s, "attribAbove"));
    fs.appendChild(H.fld("Big statement", s, "text", {area:true, rows:3}));
    fs.appendChild(H.fld("Small line below (optional)", s, "attribBelow"));
    host.appendChild(fs);
  },
  _size:function(t){ var n=(t||"").length; return n>220?20 : n>140?26 : n>80?32 : 40; },
  preview:function(s,host,H){
    const PV=H.pv,TH=H.TH;
    PV.box(host,{x:0,y:0,w:10,h:5.625,bg:TH.MAROON});
    PV.box(host,{x:0,y:0,w:10,h:0.06,bg:TH.GOLD});
    PV.box(host,{x:0,y:5.565,w:10,h:0.06,bg:TH.GOLD});
    if(s.attribAbove) PV.text(host,{x:1,y:1.0,w:8,h:0.4,text:s.attribAbove,size:12,bold:true,color:TH.GOLD,align:"center"});
    PV.text(host,{x:0.9,y:1.5,w:8.2,h:2.6,text:'\u201C'+(s.text||"")+'\u201D',size:this._size(s.text),bold:true,color:"FFFFFF",align:"center",valign:"middle"});
    if(s.attribBelow) PV.text(host,{x:1,y:4.4,w:8,h:0.4,text:s.attribBelow,size:12,color:"FFFFFF",align:"center"});
  },
  pptx:function(pres,s,d,H){
    const TH=H.TH;
    s.background={color:TH.MAROON};
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:10,h:0.06,fill:{color:TH.GOLD}});
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:5.565,w:10,h:0.06,fill:{color:TH.GOLD}});
    if(d.attribAbove) s.addText(d.attribAbove,{x:1,y:1.0,w:8,h:0.4,fontFace:TH.FONT,fontSize:12,bold:true,color:TH.GOLD,align:"center",margin:0});
    s.addText('\u201C'+(d.text||"")+'\u201D',{x:0.9,y:1.5,w:8.2,h:2.6,fontFace:TH.FONT,fontSize:this._size(d.text),bold:true,color:"FFFFFF",align:"center",valign:"middle",margin:0});
    if(d.attribBelow) s.addText(d.attribBelow,{x:1,y:4.4,w:8,h:0.4,fontFace:TH.FONT,fontSize:12,color:"FFFFFF",align:"center",margin:0});
  }
});
