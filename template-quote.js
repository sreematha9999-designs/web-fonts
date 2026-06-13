/* template-quote.js — testimonial: someone's words + name/role + optional photo. Adaptive text size. */
OWOF.registerTemplate({
  type:"quote", label:"Quote / testimonial",
  defaults:function(){ return {type:"quote", text:"Their words go here.", name:"Name", role:"Role / Organisation", img:null}; },
  editor:function(s,host,H){
    const fs=H.fieldset("Quote");
    fs.appendChild(H.fld("Quote text", s, "text", {area:true, rows:4}));
    const g=document.createElement("div"); g.className="grid2";
    g.appendChild(H.fld("Name", s, "name"));
    g.appendChild(H.fld("Role / Organisation", s, "role"));
    fs.appendChild(g);
    fs.appendChild(H.imgField("Photo (optional — upload or images/…path)", s, "img"));
    host.appendChild(fs);
  },
  _size:function(t){ var n=(t||"").length; return n>260?15 : n>170?18 : n>90?21 : 25; },
  preview:function(s,host,H){
    const PV=H.pv,TH=H.TH;
    var hasImg=!!s.img;
    var quoteW = hasImg ? 5.7 : 8.6;
    PV.box(host,{x:0.45,y:0.55,w:9.1,h:4.5,bg:TH.MAROON,radius:true,shadow:true});
    PV.text(host,{x:0.8,y:0.7,w:1.2,h:1.0,text:'\u201C',size:60,bold:true,color:TH.GOLD});
    PV.text(host,{x:0.9,y:1.6,w:quoteW,h:2.2,text:s.text||"",size:this._size(s.text),italic:true,color:"FFFFFF",valign:"middle"});
    PV.text(host,{x:0.9,y:4.0,w:quoteW,h:0.4,text:s.name||"",size:14,bold:true,color:TH.GOLD});
    PV.text(host,{x:0.9,y:4.4,w:quoteW,h:0.35,text:s.role||"",size:10.5,color:"FFFFFF"});
    if(hasImg){ var im=PV.img(host,{x:6.85,y:1.0,w:2.4,h:3.6,src:s.img}); im.style.border="0.3cqw solid #"+TH.GOLD; }
  },
  pptx:function(pres,s,d,H){
    const TH=H.TH;
    s.background={color:TH.CREAM};
    var hasImg=!!d.img;
    var quoteW = hasImg ? 5.7 : 8.6;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.45,y:0.55,w:9.1,h:4.5,rectRadius:0.12,fill:{color:TH.MAROON},shadow:H.shadow()});
    s.addText('\u201C',{x:0.8,y:0.7,w:1.2,h:1.0,fontFace:TH.FONT,fontSize:60,bold:true,color:TH.GOLD,margin:0});
    s.addText(d.text||"",{x:0.9,y:1.6,w:quoteW,h:2.2,fontFace:TH.FONT,fontSize:this._size(d.text),italic:true,color:"FFFFFF",valign:"middle",margin:0});
    s.addText(d.name||"",{x:0.9,y:4.0,w:quoteW,h:0.4,fontFace:TH.FONT,fontSize:14,bold:true,color:TH.GOLD,margin:0});
    s.addText(d.role||"",{x:0.9,y:4.4,w:quoteW,h:0.35,fontFace:TH.FONT,fontSize:10.5,color:"FFFFFF",margin:0});
    if(hasImg){
      H.addImg(pres,s,d.img,{x:6.85,y:1.0,w:2.4,h:3.6,sizing:{type:"cover",w:2.4,h:3.6}});
      s.addShape(pres.shapes.RECTANGLE,{x:6.85,y:1.0,w:2.4,h:3.6,fill:{type:"none"},line:{color:TH.GOLD,width:2.25}});
    }
  }
});
