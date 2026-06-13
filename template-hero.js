/* template-hero.js — cover. THREE variants: hero (full-bleed), split (panel), classic (strip).
   Slide-level intelligence: title font auto-fits via H.fitText in every variant. */
OWOF.registerTemplate({
  type:"hero", label:"Cover",

  variants:[
    {id:"hero",    label:"Full-bleed"},
    {id:"split",   label:"Split panel"},
    {id:"classic", label:"Classic + strip"}
  ],

  defaults:function(){ return {type:"hero", variant:"hero", num:"01", name:"PROJECT NAME", sub:"Subtitle · Month 2026", img:null}; },

  editor:function(s,host,H){
    const fs=H.fieldset("Cover content");
    const g=document.createElement("div"); g.className="grid3";
    g.appendChild(H.fld("Project number (optional)", s, "num"));
    g.appendChild(H.fld("Project name", s, "name"));
    g.appendChild(H.fld("Subtitle line", s, "sub"));
    fs.appendChild(g);
    fs.appendChild(H.imgField("3D view / photo (upload or images/…path)", s, "img"));
    const hint=document.createElement("p"); hint.className="hint";
    hint.textContent="Pick a design on the right (Full-bleed, Split, or Classic). Title size auto-adjusts to its length.";
    fs.appendChild(hint);
    if(H.overflowRisk(s.name, 8, 1.0, 18)) H.warnBox(fs, "Project name is long — it will shrink to fit. Consider shortening for impact.");
    host.appendChild(fs);
  },

  /* ---------- PREVIEW ---------- */
  preview:function(s,host,H){
    const v=s.variant||"hero";
    if(v==="split") this._pvSplit(s,host,H);
    else if(v==="classic") this._pvClassic(s,host,H);
    else this._pvHero(s,host,H);
  },
  _pvHero:function(s,host,H){ const PV=H.pv,TH=H.TH;
    if(s.img) PV.img(host,{x:0,y:0,w:10,h:5.625,src:s.img});
    else PV.text(host,{x:0,y:0,w:10,h:4.6,text:"PHOTO — full-page",size:12,color:TH.MUTED,align:"center",valign:"middle",bg:"F2EAD2"});
    PV.box(host,{x:0,y:4.72,w:10,h:0.905,bg:TH.MAROON}).style.opacity="0.94";
    PV.box(host,{x:0,y:4.68,w:10,h:0.045,bg:TH.GOLD});
    if(s.num) PV.text(host,{x:0.45,y:4.72,w:0.95,h:0.905,text:s.num,size:34,bold:true,color:TH.GOLD,valign:"middle"});
    PV.rich(host,{x:s.num?1.5:0.6,y:4.72,w:8.0,h:0.905,valign:"middle"},[
      {text:(s.name||"").toUpperCase()+"   ",size:H.fitText(s.name,7.5,0.6,19,12),bold:true,color:"FFFFFF"},
      {text:s.sub||"",size:10.5,bold:true,color:TH.GOLD}]);
  },
  _pvSplit:function(s,host,H){ const PV=H.pv,TH=H.TH;
    if(s.img) PV.img(host,{x:4.1,y:0,w:5.9,h:5.625,src:s.img});
    else PV.text(host,{x:4.1,y:0,w:5.9,h:5.625,text:"PHOTO",size:12,color:TH.MUTED,align:"center",valign:"middle",bg:"F2EAD2"});
    PV.box(host,{x:0,y:0,w:4.1,h:5.625,bg:TH.MAROON});
    PV.box(host,{x:4.06,y:0,w:0.05,h:5.625,bg:TH.GOLD});
    if(s.num) PV.text(host,{x:0.45,y:1.1,w:3.3,h:0.4,text:"PROJECT "+s.num,size:13,bold:true,color:TH.GOLD});
    PV.rich(host,{x:0.45,y:1.6,w:3.35,h:3.0,valign:"middle"},[
      {text:(s.name||"").toUpperCase(),size:H.fitText(s.name,3.2,1.6,24,13),bold:true,color:"FFFFFF",block:true},
      {text:s.sub||"",size:11.5,bold:true,color:TH.GOLD,block:true}]);
  },
  _pvClassic:function(s,host,H){ const PV=H.pv,TH=H.TH;
    PV.logo(host,false);
    PV.box(host,{x:0.45,y:0.95,w:9.1,h:2.3,bg:TH.MAROON,radius:true,shadow:true});
    PV.rich(host,{x:0.95,y:1.15,w:8.1,h:1.9,valign:"middle"},[
      {text:(s.name||"").toUpperCase(),size:H.fitText(s.name,7.8,1.0,30,16),bold:true,color:"FFFFFF",block:true},
      {text:(s.num?s.num+" · ":"")+(s.sub||""),size:13,bold:true,color:TH.GOLD,block:true}]);
    if(s.img) PV.img(host,{x:0.45,y:3.5,w:9.1,h:1.75,src:s.img}).style.border="0.25cqw solid #"+TH.GOLD;
    else PV.text(host,{x:0.45,y:3.5,w:9.1,h:1.75,text:"PHOTO — panoramic strip",size:11,color:TH.MUTED,align:"center",valign:"middle",bg:"F2EAD2",line:TH.GOLD,dash:true,radius:true});
  },

  /* ---------- PPTX ---------- */
  pptx:function(pres,s,d,H){
    const v=d.variant||"hero";
    if(v==="split") this._pxSplit(pres,s,d,H);
    else if(v==="classic") this._pxClassic(pres,s,d,H);
    else this._pxHero(pres,s,d,H);
  },
  _pxHero:function(pres,s,d,H){ const TH=H.TH; s.background={color:TH.CREAM};
    if(d.img) H.addImg(pres,s,d.img,{x:0,y:0,w:10,h:5.625,sizing:{type:"cover",w:10,h:5.625}});
    else H.placeholderBox(pres,s,0,0,10,4.6,"full-page 3D view");
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:4.72,w:10,h:0.905,fill:{color:TH.MAROON,transparency:8}});
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:4.68,w:10,h:0.04,fill:{color:TH.GOLD}});
    if(d.num) s.addText(d.num,{x:0.45,y:4.72,w:0.95,h:0.905,fontFace:TH.FONT,fontSize:34,bold:true,color:TH.GOLD,margin:0,valign:"middle"});
    s.addText([{text:(d.name||"").toUpperCase()+"   ",options:{fontSize:H.fitText(d.name,7.5,0.6,19,12),bold:true,color:"FFFFFF"}},
               {text:d.sub||"",options:{fontSize:10.5,bold:true,color:TH.GOLD}}],
      {x:d.num?1.5:0.6,y:4.72,w:8.0,h:0.905,fontFace:TH.FONT,valign:"middle",margin:0});
  },
  _pxSplit:function(pres,s,d,H){ const TH=H.TH; s.background={color:TH.CREAM};
    if(d.img) H.addImg(pres,s,d.img,{x:4.1,y:0,w:5.9,h:5.625,sizing:{type:"cover",w:5.9,h:5.625}});
    else H.placeholderBox(pres,s,4.1,0,5.9,5.625,"3D view");
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:4.1,h:5.625,fill:{color:TH.MAROON}});
    s.addShape(pres.shapes.RECTANGLE,{x:4.06,y:0,w:0.05,h:5.625,fill:{color:TH.GOLD}});
    if(d.num) s.addText("PROJECT "+d.num,{x:0.45,y:1.1,w:3.3,h:0.4,fontFace:TH.FONT,fontSize:13,bold:true,color:TH.GOLD,charSpacing:2,margin:0});
    s.addText([{text:(d.name||"").toUpperCase(),options:{fontSize:H.fitText(d.name,3.2,1.6,24,13),bold:true,color:"FFFFFF",breakLine:true}},
               {text:d.sub||"",options:{fontSize:11.5,bold:true,color:TH.GOLD}}],
      {x:0.45,y:1.6,w:3.35,h:3.0,fontFace:TH.FONT,valign:"middle",lineSpacing:22,margin:0});
  },
  _pxClassic:function(pres,s,d,H){ const TH=H.TH; s.background={color:TH.CREAM};
    H.logoChip(pres,s,false);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.45,y:0.95,w:9.1,h:2.3,rectRadius:0.12,fill:{color:TH.MAROON},shadow:H.shadow()});
    s.addText([{text:(d.name||"").toUpperCase(),options:{fontSize:H.fitText(d.name,7.8,1.0,30,16),bold:true,color:"FFFFFF",breakLine:true}},
               {text:(d.num?d.num+" · ":"")+(d.sub||""),options:{fontSize:13,bold:true,color:TH.GOLD}}],
      {x:0.95,y:1.15,w:8.1,h:1.9,fontFace:TH.FONT,valign:"middle",lineSpacing:28,margin:0});
    if(d.img){ H.addImg(pres,s,d.img,{x:0.45,y:3.5,w:9.1,h:1.75,sizing:{type:"cover",w:9.1,h:1.75}});
      s.addShape(pres.shapes.RECTANGLE,{x:0.45,y:3.5,w:9.1,h:1.75,fill:{type:"none"},line:{color:TH.GOLD,width:2}}); }
    else H.placeholderBox(pres,s,0.45,3.5,9.1,1.75,"panoramic strip");
  }
});
