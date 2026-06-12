/* templates/hero.js — code chapter: full-page image cover with slim name strip.
   Self-contained: replacing this file cannot break any other chapter. */
OWOF.registerTemplate({
  type: "hero",
  label: "Cover — full-page image",

  defaults: function(){
    return { type:"hero", num:"01", name:"PROJECT NAME", sub:"Subtitle · Month 2026", img:null };
  },

  editor: function(s, host, H){
    const fs = H.fieldset("Cover content");
    const g = document.createElement("div"); g.className = "grid3";
    g.appendChild(H.fld("Project number (e.g. 01)", s, "num"));
    g.appendChild(H.fld("Project name", s, "name"));
    g.appendChild(H.fld("Subtitle line", s, "sub"));
    fs.appendChild(g);
    fs.appendChild(H.imgField("Full-page 3D view / photo (fills the slide)", s, "img"));
    const hint = document.createElement("p"); hint.className = "hint";
    hint.textContent = "Wide (16:9-ish) images look best — the image is cropped to fill the page. Uploads are auto-compressed for fast builds; or type the path of a photo already in your repo, e.g. images/qblock.jpg";
    fs.appendChild(hint);
    host.appendChild(fs);
  },

  preview: function(s, host, H){
    const PV = H.pv, TH = H.TH;
    if(s.img) PV.img(host,{x:0,y:0,w:10,h:5.625,src:s.img});
    else PV.text(host,{x:0,y:0,w:10,h:4.6,text:"PHOTO — full-page 3D view",size:12,color:TH.MUTED,align:"center",valign:"middle",bg:"F2EAD2"});
    PV.box(host,{x:0,y:4.72,w:10,h:0.905,bg:TH.MAROON}).style.opacity = "0.94";
    PV.box(host,{x:0,y:4.68,w:10,h:0.045,bg:TH.GOLD});
    PV.text(host,{x:0.45,y:4.72,w:0.95,h:0.905,text:s.num||"",size:34,bold:true,color:TH.GOLD,valign:"middle"});
    PV.rich(host,{x:1.5,y:4.72,w:8.4,h:0.905,valign:"middle"},[
      {text:(s.name||"").toUpperCase()+"   ", size:19, bold:true, color:"FFFFFF"},
      {text:s.sub||"", size:10.5, bold:true, color:TH.GOLD}
    ]);
  },

  pptx: function(pres, s, d, H){
    const TH = H.TH;
    s.background = {color:TH.CREAM};
    if(d.img) H.addImg(pres, s, d.img, {x:0,y:0,w:10,h:5.625,sizing:{type:"cover",w:10,h:5.625}});
    else H.placeholderBox(pres, s, 0,0,10,4.6,"full-page 3D view");
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:4.72,w:10,h:0.905,fill:{color:TH.MAROON,transparency:8}});
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:4.68,w:10,h:0.04,fill:{color:TH.GOLD}});
    s.addText(d.num||"",{x:0.45,y:4.72,w:0.95,h:0.905,fontFace:TH.FONT,fontSize:34,bold:true,color:TH.GOLD,margin:0,valign:"middle"});
    s.addText([
      {text:(d.name||"").toUpperCase()+"   ", options:{fontSize:19,bold:true,color:"FFFFFF"}},
      {text:d.sub||"", options:{fontSize:10.5,bold:true,color:TH.GOLD}}
    ],{x:1.5,y:4.72,w:8.4,h:0.905,fontFace:TH.FONT,valign:"middle",margin:0});
  }
});
