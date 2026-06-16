/* a4-cover.js — A4 Cover page.
   Preview uses true A4 portrait container (aspect-ratio 595/842).
   Coordinates are in A4 inches: W=8.268, H=11.693, margin=0.55 */
OWOF.registerA4Template({
  type:"a4-cover", label:"Cover page",
  docTypes:["csr","project-update","fundraising","annual-report","event"],

  defaults:function(){
    return {type:"a4-cover",
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
    fs.appendChild(H.imgField("Cover image (hero photo)", s, "img"));
    var hint=document.createElement("p"); hint.className="hint";
    hint.textContent="A4 portrait (210 × 297mm). Download A4 button exports this correctly.";
    fs.appendChild(hint);
    host.appendChild(fs);
  },

  /* PREVIEW — uses A4 portrait container.
     PV coordinates are percentages of the A4 page: x% of 8.268", y% of 11.693"
     We use inline styles directly since PV.box uses cqw (container-query width units).
     In a portrait container cqw = 1% of container WIDTH, so we express y in terms of width too. */
  preview:function(s, host, H){
    var TH=H.TH;
    /* helper: place element as % of A4 page */
    function box(x,y,w,h,bg,extra){
      var d=document.createElement("div");
      d.style.position="absolute";
      d.style.left=(x/8.268*100)+"%";
      d.style.top=(y/11.693*100)+"%";
      d.style.width=(w/8.268*100)+"%";
      d.style.height=(h/11.693*100)+"%";
      if(bg) d.style.background="#"+bg;
      if(extra) Object.assign(d.style,extra);
      host.appendChild(d); return d;
    }
    function txt(x,y,w,h,text,opts){
      var d=box(x,y,w,h,null,{display:"flex",alignItems:opts&&opts.va==="bottom"?"flex-end":opts&&opts.va==="middle"?"center":"flex-start",
        justifyContent:opts&&opts.align==="center"?"center":opts&&opts.align==="right"?"flex-end":"flex-start",
        padding:"0 1%",overflow:"hidden",fontSize:(opts&&opts.size||9)*(w/8.268)*0.9+"cqw",
        fontWeight:(opts&&opts.bold)?"700":"400",fontStyle:(opts&&opts.italic)?"italic":"normal",
        color:"#"+(opts&&opts.color||TH.INK),lineHeight:"1.3",
        fontFamily:(opts&&opts.serif)?"Cambria,Georgia,serif":"Arial,sans-serif"});
      d.textContent=text||""; return d;
    }

    host.style.background="#"+TH.CREAM;

    /* maroon top band */
    box(0,0,8.268,1.1,TH.MAROON);
    box(0,1.07,8.268,0.04,TH.GOLD);
    txt(0.55,0.18,6.5,0.75,s.org||"",{bold:true,color:"FFFFFF",va:"middle",serif:true,size:11});

    /* logo chip */
    var chip=box(7.25,0.15,0.75,0.75,"FFFFFF",{borderRadius:"50%",border:"1.5px solid #"+TH.GOLD,display:"flex",alignItems:"center",justifyContent:"center"});
    chip.style.fontSize="4.5cqw"; chip.style.fontWeight="700"; chip.style.color="#"+TH.MAROON;
    chip.style.textAlign="center"; chip.style.lineHeight="1.1"; chip.textContent="ONE\nWORLD\nOWOF";

    /* hero image zone */
    if(s.img){
      var im=box(0,1.11,8.268,5.8,null,{backgroundImage:"url('"+s.img+"')",backgroundSize:"cover",backgroundPosition:"center"});
    } else {
      box(0,1.11,8.268,5.8,"E0D8C8",{display:"flex",alignItems:"center",justifyContent:"center"});
      txt(0,1.11,8.268,5.8,"COVER IMAGE",{color:"A09080",align:"center",va:"middle",size:10});
    }

    /* gold divider + maroon title band */
    box(0,6.62,8.268,0.04,TH.GOLD);
    box(0,6.66,8.268,2.65,TH.MAROON);
    txt(0.55,6.88,7.168,1.1,(s.title||"").toUpperCase(),{bold:true,color:"FFFFFF",va:"middle",serif:true,size:H.fitText(s.title||"",7.168,1.1,18,11)});
    txt(0.55,7.98,7.168,0.45,s.subtitle||"",{bold:true,color:TH.GOLD,size:9});
    txt(0.55,8.55,7.168,0.35,s.date||"",{color:"FFFFFF",size:8});

    /* cream section */
    box(0,9.31,8.268,0.04,TH.GOLD);
    box(0,9.35,8.268,1.97,TH.CREAM);
    txt(0.55,9.55,7.168,0.4,s.prepared||"",{color:TH.MAROON,size:8});

    /* footer */
    box(0,11.38,8.268,0.31,TH.DMAROON);
    txt(0.55,11.38,7.168,0.31,(s.org||"").toUpperCase(),{bold:true,color:TH.GOLD,align:"center",va:"middle",size:6});
  },

  a4:function(pres, slide, d, H){
    var TH=H.TH, W=8.268, M=0.55, CW=7.168;
    slide.background={color:TH.CREAM};
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:W,h:1.1,fill:{color:TH.MAROON}});
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:1.07,w:W,h:0.04,fill:{color:TH.GOLD}});
    slide.addText(d.org||"",{x:M,y:0.18,w:W-2*M-1.2,h:0.75,fontFace:"Cambria",fontSize:13,bold:true,color:"FFFFFF",valign:"middle",margin:0});
    slide.addShape(pres.shapes.OVAL,{x:W-M-0.9,y:0.15,w:0.75,h:0.75,fill:{color:"FFFFFF"},line:{color:TH.GOLD,width:1.5}});
    var bl=TH.BRAND.map(function(t,i){return {text:t,options:{breakLine:i<TH.BRAND.length-1}};});
    slide.addText(bl,{x:W-M-0.9,y:0.15,w:0.75,h:0.75,fontFace:TH.FONT,fontSize:5.5,bold:true,color:TH.MAROON,align:"center",valign:"middle",margin:0});
    if(d.img){ H.addImg(pres,slide,d.img,{x:0,y:1.11,w:W,h:5.8,sizing:{type:"cover",w:W,h:5.8}}); }
    else { slide.addShape(pres.shapes.RECTANGLE,{x:0,y:1.11,w:W,h:5.8,fill:{color:"E0D8C8"}}); slide.addText("COVER IMAGE",{x:0,y:1.11,w:W,h:5.8,fontFace:TH.FONT,fontSize:14,color:"A09080",align:"center",valign:"middle"}); }
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:6.62,w:W,h:0.04,fill:{color:TH.GOLD}});
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:6.66,w:W,h:2.65,fill:{color:TH.MAROON}});
    slide.addText((d.title||"").toUpperCase(),{x:M,y:6.88,w:CW,h:1.1,fontFace:"Cambria",fontSize:H.fitText(d.title||"",CW,1.1,22,14),bold:true,color:"FFFFFF",margin:0,valign:"middle"});
    slide.addText(d.subtitle||"",{x:M,y:7.98,w:CW,h:0.45,fontFace:TH.FONT,fontSize:12,bold:true,color:TH.GOLD,margin:0});
    slide.addText(d.date||"",{x:M,y:8.55,w:CW,h:0.35,fontFace:TH.FONT,fontSize:10,color:"FFFFFF",margin:0});
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:9.31,w:W,h:0.04,fill:{color:TH.GOLD}});
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:9.35,w:W,h:1.97,fill:{color:TH.CREAM}});
    slide.addText(d.prepared||"",{x:M,y:9.55,w:CW,h:0.4,fontFace:TH.FONT,fontSize:10,color:TH.MAROON,margin:0});
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:11.38,w:W,h:0.31,fill:{color:TH.DMAROON}});
    slide.addText((d.org||"").toUpperCase(),{x:M,y:11.38,w:CW,h:0.31,fontFace:TH.FONT,fontSize:7.5,bold:true,color:TH.GOLD,align:"center",valign:"middle",charSpacing:1});
  }
});
