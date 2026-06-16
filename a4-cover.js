/* a4-cover.js — A4 Cover page and Back Cover.
   Block mode only (cover is always structured).
   Reads theme from H.TH (same as landscape). */
OWOF.registerA4Template({
  type:"a4-cover", label:"Cover page",
  docTypes:["csr","project-update","fundraising","annual-report","event"],

  defaults:function(){
    return {type:"a4-cover", variant:"hero",
      org:"One World One Family Mission",
      title:"Document Title",
      subtitle:"Subtitle or tagline",
      date:"June 2026",
      img:null,
      prepared:"Prepared by: OWOF Construction Team"};
  },

  editor:function(s, host, H){
    var fs=H.fieldset("Cover content");
    fs.appendChild(H.fld("Organisation name", s, "org"));
    fs.appendChild(H.fld("Document title (large)", s, "title"));
    fs.appendChild(H.fld("Subtitle / tagline", s, "subtitle"));
    var g=document.createElement("div"); g.className="grid2";
    g.appendChild(H.fld("Date", s, "date"));
    g.appendChild(H.fld("Prepared by line", s, "prepared"));
    fs.appendChild(g);
    fs.appendChild(H.imgField("Cover image (hero — full bleed or featured)", s, "img"));
    host.appendChild(fs);
  },

  /* A4 PPTX renderer */
  a4:function(pres, slide, d, H){
    var TH=H.TH, W=8.268, H_=11.693, M=0.55;
    slide.background={color:TH.CREAM};

    /* top maroon band */
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:W,h:1.1,fill:{color:TH.MAROON}});
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:1.07,w:W,h:0.04,fill:{color:TH.GOLD}});

    /* org name in top band */
    slide.addText(d.org||"",{x:M,y:0.18,w:W-2*M-1.2,h:0.75,
      fontFace:"Cambria",fontSize:13,bold:true,color:"FFFFFF",valign:"middle",margin:0});

    /* logo chip */
    slide.addShape(pres.shapes.OVAL,{x:W-M-0.9,y:0.15,w:0.75,h:0.75,
      fill:{color:"FFFFFF"},line:{color:TH.GOLD,width:1.5}});
    var brandLines=TH.BRAND.map(function(t,i){return {text:t,options:{breakLine:i<TH.BRAND.length-1}};});
    slide.addText(brandLines,{x:W-M-0.9,y:0.15,w:0.75,h:0.75,
      fontFace:TH.FONT,fontSize:5.5,bold:true,color:TH.MAROON,align:"center",valign:"middle",margin:0});

    /* hero image zone */
    if(d.img){
      H.addImg(pres,slide,d.img,{x:0,y:1.11,w:W,h:5.8,sizing:{type:"cover",w:W,h:5.8}});
    } else {
      slide.addShape(pres.shapes.RECTANGLE,{x:0,y:1.11,w:W,h:5.8,fill:{color:"E0D8C8"}});
      slide.addText("COVER IMAGE",{x:0,y:1.11,w:W,h:5.8,fontFace:TH.FONT,fontSize:14,
        color:"A09080",align:"center",valign:"middle"});
    }

    /* title block */
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:6.62,w:W,h:0.04,fill:{color:TH.GOLD}});
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:6.66,w:W,h:2.65,fill:{color:TH.MAROON}});

    var titleSize=H.fitText(d.title||"",W-2*M,1.2,28,16);
    slide.addText((d.title||"").toUpperCase(),{x:M,y:6.88,w:W-2*M,h:1.1,
      fontFace:"Cambria",fontSize:titleSize,bold:true,color:"FFFFFF",margin:0,lineSpacing:titleSize*1.25});
    slide.addText(d.subtitle||"",{x:M,y:7.98,w:W-2*M,h:0.45,
      fontFace:TH.FONT,fontSize:12,bold:true,color:TH.GOLD,margin:0});
    slide.addText(d.date||"",{x:M,y:8.48,w:W-2*M,h:0.35,
      fontFace:TH.FONT,fontSize:10,color:"FFFFFF",margin:0});

    /* bottom cream section */
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:9.31,w:W,h:0.04,fill:{color:TH.GOLD}});
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:9.35,w:W,h:2.343,fill:{color:TH.CREAM}});
    slide.addText(d.prepared||"",{x:M,y:9.55,w:W-2*M,h:0.4,
      fontFace:TH.FONT,fontSize:10,color:TH.MAROON,margin:0});

    /* footer */
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:11.38,w:W,h:0.31,fill:{color:TH.DMAROON}});
    slide.addText((d.org||"").toUpperCase(),{x:M,y:11.38,w:W-2*M,h:0.31,
      fontFace:TH.FONT,fontSize:7.5,bold:true,color:TH.GOLD,align:"center",valign:"middle",charSpacing:1});
  },

  /* A4 PREVIEW — same proportions, CSS-scaled */
  preview:function(s, host, H){
    var PV=H.pv, TH=H.TH, W=8.268, PH=11.693;
    /* Scale everything to the 10×5.625 preview canvas proportionally */
    var sx=10/W, sy=5.625/PH;
    function b(x,y,w,h,bg,opts){ PV.box(host,Object.assign({x:x*sx,y:y*sy,w:w*sx,h:h*sy,bg:bg},opts||{})); }
    function t(x,y,w,h,text,size,opts){ PV.text(host,Object.assign({x:x*sx,y:y*sy,w:w*sx,h:h*sy,text:text,size:size*sx},opts||{})); }

    b(0,0,W,11.693,TH.CREAM);
    b(0,0,W,1.1,TH.MAROON);
    b(0,1.07,W,0.04,TH.GOLD);
    t(0.55,0.18,6.5,0.75,s.org||"",9,{bold:true,color:"FFFFFF",valign:"middle"});
    if(s.img){ PV.img(host,{x:0,y:1.11*sy,w:10,h:5.8*sy,src:s.img}); }
    else b(0,1.11,W,5.8,"E0D8C8");
    b(0,6.62,W,0.04,TH.GOLD);
    b(0,6.66,W,2.65,TH.MAROON);
    t(0.55,6.88,7.168,1.1,(s.title||"").toUpperCase(),H.fitText(s.title,7,1.2,18,11),{bold:true,color:"FFFFFF",valign:"middle"});
    t(0.55,7.98,7.168,0.45,s.subtitle||"",8.5,{bold:true,color:TH.GOLD});
    b(0,9.31,W,0.04,TH.GOLD);
    b(0,9.35,W,2.343,TH.CREAM);
    b(0,11.38,W,0.31,TH.DMAROON);
    t(0.55,11.38,7.168,0.31,(s.org||"").toUpperCase(),6,{bold:true,color:TH.GOLD,align:"center",valign:"middle"});
  }
});
