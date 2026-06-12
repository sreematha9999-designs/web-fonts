/* template-thanks.js — code chapter: maroon closing slide. */
OWOF.registerTemplate({
  type: "thanks",
  label: "Thank you",

  defaults: function(){
    return { type:"thanks", line1:"One World One Family Mission",
      line2:"All Projects — Progress Report · Month 2026" };
  },

  editor: function(s, host, H){
    const fs = H.fieldset("Thank-you slide");
    fs.appendChild(H.fld("Line under THANK YOU (gold)", s, "line1"));
    fs.appendChild(H.fld("Second line (white)", s, "line2"));
    host.appendChild(fs);
  },

  preview: function(s, host, H){
    const PV = H.pv, TH = H.TH;
    PV.box(host,{x:0,y:0,w:10,h:5.625,bg:TH.MAROON});
    PV.box(host,{x:0,y:0,w:10,h:0.06,bg:TH.GOLD});
    PV.box(host,{x:0,y:5.565,w:10,h:0.06,bg:TH.GOLD});
    var c = PV.box(host,{x:4.67,y:1.15,w:0.66,h:0.66,bg:"FFFFFF",line:TH.GOLD,lineW:0.3});
    c.style.borderRadius = "50%";
    PV.text(host,{x:0.5,y:2.15,w:9.0,h:0.9,text:"THANK YOU",size:44,bold:true,color:"FFFFFF",align:"center"});
    PV.box(host,{x:4.3,y:3.15,w:1.4,h:0.035,bg:TH.GOLD});
    PV.text(host,{x:0.5,y:3.35,w:9.0,h:0.4,text:s.line1||"",size:15,bold:true,color:TH.GOLD,align:"center"});
    PV.text(host,{x:0.5,y:3.8,w:9.0,h:0.35,text:s.line2||"",size:11,color:"FFFFFF",align:"center"});
  },

  pptx: function(pres, s, d, H){
    const TH = H.TH;
    s.background = {color:TH.MAROON};
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:10,h:0.06,fill:{color:TH.GOLD}});
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:5.565,w:10,h:0.06,fill:{color:TH.GOLD}});
    s.addShape(pres.shapes.OVAL,{x:4.67,y:1.15,w:0.66,h:0.66,fill:{color:"FFFFFF"},line:{color:TH.GOLD,width:2}});
    s.addText("THANK YOU",{x:0.5,y:2.15,w:9.0,h:0.9,fontFace:TH.FONT,fontSize:44,bold:true,color:"FFFFFF",align:"center",margin:0});
    s.addShape(pres.shapes.RECTANGLE,{x:4.3,y:3.15,w:1.4,h:0.035,fill:{color:TH.GOLD}});
    s.addText(d.line1||"",{x:0.5,y:3.35,w:9.0,h:0.4,fontFace:TH.FONT,fontSize:15,bold:true,color:TH.GOLD,align:"center",margin:0});
    s.addText(d.line2||"",{x:0.5,y:3.8,w:9.0,h:0.35,fontFace:TH.FONT,fontSize:11,color:"FFFFFF",align:"center",margin:0});
  }
});
