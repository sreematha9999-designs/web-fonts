/* a4-story.js — A4 story/impact page. Both Flow + Block mode live simultaneously.
   Portrait preview uses percentage-based positioning. */
OWOF.registerA4Template({
  type:"a4-story", label:"Story / impact page",
  docTypes:["csr","fundraising","annual-report"],

  defaults:function(){
    return {type:"a4-story", sectionTitle:"The Need",
      blocks:[
        {type:"headline", content:"TRANSFORMING LIVES THROUGH HEALTHCARE", primary:false, props:{}},
        {type:"stat",     content:"60%", primary:true, props:{label:"Overall Progress"}},
        {type:"paragraph",content:"The Sai Sharanam Girls Hostel provides safe, modern accommodation for nursing students at Sri Madhusudan Sai Institute of Medical Sciences and Research. With a G+3 structure nearing completion, this facility will house 200+ students and transform the pipeline of healthcare professionals in the region.", primary:false, props:{}},
        {type:"pullquote",content:"Every room built is a future doctor housed, a life changed.", primary:false, props:{attribution:"Project Vision, OWOF"}},
        {type:"photo",    content:"", primary:false, props:{label:"Site photo"}}
      ],
      footerNote:""};
  },

  editor:function(s, host, H){
    var self=this;
    var fs0=H.fieldset("Section");
    fs0.appendChild(H.fld("Section title", s, "sectionTitle"));
    fs0.appendChild(H.fld("Footer note (optional)", s, "footerNote"));
    host.appendChild(fs0);

    /* Dual panel */
    var dual=document.createElement("div");
    dual.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;";
    host.appendChild(dual);

    /* FLOW panel */
    var flowWrap=document.createElement("fieldset");
    flowWrap.innerHTML="<legend>FLOW — type freely</legend>";
    var flowTA=document.createElement("textarea"); flowTA.rows=16;
    flowTA.placeholder="Type your content here.\n\nDetected automatically:\n60% → stat (next line = label)\n• item → bullet\n\"quote\" — Name → pull quote\nALL CAPS → headline\nParagraph text flows naturally.\n\nUpload photo below.";
    flowTA.style.cssText="width:100%;font-size:12px;line-height:1.6;resize:vertical;";
    flowTA.value=self._blocksToFlow(s.blocks||[]);
    flowWrap.appendChild(flowTA);
    flowWrap.appendChild(H.imgField("Photo for this page", s.blocks.find(function(b){return b.type==='photo';})||{type:"photo",content:"",props:{}}, "content"));
    dual.appendChild(flowWrap);

    /* BLOCK panel */
    var blockWrap=document.createElement("fieldset");
    blockWrap.innerHTML="<legend>BLOCKS — structure</legend>";
    var blockList=document.createElement("div");
    blockWrap.appendChild(blockList);
    var addBtn=document.createElement("button"); addBtn.className="btn ghost addbtn"; addBtn.textContent="+ Add block";
    addBtn.onclick=function(){ s.blocks.push({type:"paragraph",content:"",primary:false,props:{}}); renderBL(); };
    blockWrap.appendChild(addBtn);
    dual.appendChild(blockWrap);

    function renderBL(){
      blockList.innerHTML="";
      (s.blocks||[]).forEach(function(b,i){
        var row=document.createElement("div");
        row.style.cssText="display:flex;align-items:center;gap:5px;background:#FFFDF4;border:1px solid #E5D9A8;border-radius:6px;padding:4px 6px;margin-bottom:4px;";
        var ic=document.createElement("span"); ic.style.cssText="color:#C9A227;width:16px;flex:none;font-size:12px;";
        ic.textContent=(window.A4_BLOCKS&&window.A4_BLOCKS[b.type]?window.A4_BLOCKS[b.type].icon:"·");
        var sel=document.createElement("select"); sel.style.cssText="font-size:11px;padding:1px 3px;flex:none;width:105px;";
        if(window.A4_BLOCKS) Object.keys(A4_BLOCKS).forEach(function(k){
          var o=document.createElement("option"); o.value=k; o.textContent=A4_BLOCKS[k].label; if(b.type===k)o.selected=true; sel.appendChild(o);
        });
        sel.onchange=function(){ b.type=sel.value; ic.textContent=(A4_BLOCKS[b.type]||{icon:"·"}).icon; H.refreshLight(); };
        var inp=document.createElement("input"); inp.type="text"; inp.style.cssText="flex:1;font-size:11px;padding:2px 4px;";
        inp.value=(b.content||"").substring(0,55); inp.placeholder="Content…";
        inp.oninput=function(){ b.content=inp.value; H.refreshLight(); };
        var star=document.createElement("button"); star.style.cssText="border:none;background:none;cursor:pointer;font-size:13px;";
        star.textContent=b.primary?"★":"☆"; star.title="Mark as primary";
        star.onclick=function(){ (s.blocks||[]).forEach(function(x){x.primary=false;}); b.primary=true; renderBL(); H.refreshLight(); };
        var del=document.createElement("button"); del.className="delrow"; del.textContent="✕";
        del.onclick=function(){ s.blocks.splice(i,1); renderBL(); H.refreshLight(); };
        row.appendChild(ic); row.appendChild(sel); row.appendChild(inp); row.appendChild(star); row.appendChild(del);
        blockList.appendChild(row);
      });
    }
    renderBL();

    /* Sync flow → blocks */
    var t;
    flowTA.addEventListener("input",function(){
      clearTimeout(t); t=setTimeout(function(){
        var det=window.A4_detect?A4_detect(flowTA.value):[];
        var photo=(s.blocks||[]).find(function(b){return b.type==='photo'&&b.content;});
        s.blocks=det; if(photo) s.blocks.push(photo);
        renderBL(); H.refreshLight();
      },600);
    });
  },

  _blocksToFlow:function(blocks){
    return (blocks||[]).filter(function(b){return b.type!=='photo';}).map(function(b){
      if(b.type==='headline') return (b.content||"").toUpperCase();
      if(b.type==='stat') return (b.content||"")+((b.props&&b.props.label)?"\n"+b.props.label:"");
      if(b.type==='pullquote') return "\u201C"+(b.content||"")+"\u201D"+((b.props&&b.props.attribution)?" \u2014 "+b.props.attribution:"");
      if(b.type==='bullet') return ((b.props&&b.props.items)||[b.content||""]).map(function(i){return "\u2022 "+i;}).join("\n");
      if(b.type==='divider') return "---";
      return b.content||"";
    }).filter(Boolean).join("\n\n");
  },

  /* PREVIEW — percentage-based portrait layout */
  preview:function(s, host, H){
    var TH=H.TH;
    function box(x,y,w,h,bg,extra){
      var d=document.createElement("div"); d.style.position="absolute";
      d.style.left=(x/8.268*100)+"%"; d.style.top=(y/11.693*100)+"%";
      d.style.width=(w/8.268*100)+"%"; d.style.height=(h/11.693*100)+"%";
      if(bg) d.style.background="#"+bg;
      if(extra) Object.assign(d.style,extra);
      host.appendChild(d); return d;
    }
    function txt(x,y,w,h,text,opts){
      return box(x,y,w,h,null,{display:"flex",overflow:"hidden",padding:"0 1%",
        alignItems:!opts||!opts.va?"flex-start":opts.va==="middle"?"center":"flex-end",
        justifyContent:!opts||!opts.align?"flex-start":opts.align==="center"?"center":"flex-end",
        fontSize:((opts&&opts.size)||8)*(w/8.268*100/100)+"cqw",lineHeight:"1.35",
        fontWeight:(opts&&opts.bold)?"700":"400",color:"#"+(opts&&opts.color||TH.INK),
        fontFamily:(opts&&opts.serif)?"Cambria,Georgia,serif":"Arial,sans-serif",
        fontStyle:(opts&&opts.italic)?"italic":"normal",whiteSpace:"pre-line",wordBreak:"break-word"
      }); host.lastChild.textContent=text||""; return host.lastChild;
    }

    host.style.background="#"+TH.CREAM;
    /* header */
    box(0,0,8.268,0.55,TH.MAROON);
    box(0,0.52,8.268,0.03,TH.GOLD);
    txt(0.55,0.08,7.168,0.38,(s.sectionTitle||"").toUpperCase(),{bold:true,color:"FFFFFF",va:"middle",size:10});

    var blocks=s.blocks||[];
    var stats=blocks.filter(function(b){return b.type==="stat";});
    var texts=blocks.filter(function(b){return ["paragraph","headline","bullet","pullquote"].indexOf(b.type)>=0;});
    var photoB=blocks.find(function(b){return b.type==="photo"&&b.content;});

    var y=0.72;

    /* stat row */
    if(stats.length>0){
      var sw=(7.168-0.15*(stats.length-1))/stats.length;
      stats.forEach(function(b,i){
        var x=0.55+i*(sw+0.15);
        box(x,y,sw,0.9,TH.CARD,{border:"1px solid #"+TH.GOLD,borderRadius:"4px"});
        txt(x+0.08,y+0.05,sw-0.16,0.5,b.content||"",{bold:true,color:TH.MAROON,va:"middle",size:12,align:"center"});
        txt(x+0.08,y+0.55,sw-0.16,0.3,(b.props&&b.props.label)||"",{color:TH.MUTED,size:7,align:"center"});
      });
      y+=1.05;
    }

    /* photo + text */
    if(photoB){
      var PW=3.2, TW=3.7, GAP=0.27;
      var bh=10.6-y;
      var im=box(0.55,y,PW,bh,null,{backgroundImage:"url('"+photoB.content+"')",backgroundSize:"cover",backgroundPosition:"center",border:"1.5px solid #"+TH.GOLD});
      var ty=y, tx=0.55+PW+GAP;
      texts.forEach(function(b){
        if(b.type==="headline"){ txt(tx,ty,TW,0.55,(b.content||"").toUpperCase(),{bold:true,color:TH.DMAROON,size:9.5,serif:true}); ty+=0.62; }
        else if(b.type==="pullquote"){ box(tx,ty,TW,0.85,TH.MAROON,{borderRadius:"4px"}); txt(tx+0.1,ty+0.05,TW-0.2,0.75,"\u201C"+(b.content||"")+"\u201D",{italic:true,color:"FFFFFF",size:8}); ty+=0.95; }
        else if(b.type==="bullet"){ var items=(b.props&&b.props.items)||[b.content||""]; items.forEach(function(it){ txt(tx,ty,TW,0.38,"\u2022 "+it,{color:TH.INK,size:8}); ty+=0.4; }); }
        else { txt(tx,ty,TW,Math.min(2.4,bh-ty+y+0.1),(b.content||"").substring(0,200),{color:TH.INK,size:8}); ty+=Math.min(2.4,bh-ty+y+0.1)+0.1; }
      });
    } else {
      texts.forEach(function(b){
        if(b.type==="headline"){ txt(0.55,y,7.168,0.55,(b.content||"").toUpperCase(),{bold:true,color:TH.DMAROON,size:9.5,serif:true}); y+=0.65; }
        else if(b.type==="pullquote"){ box(0.75,y,6.7,0.8,TH.MAROON,{borderRadius:"4px"}); txt(0.9,y+0.08,6.4,0.66,"\u201C"+(b.content||"")+"\u201D",{italic:true,color:"FFFFFF",size:8,align:"center"}); y+=0.95; }
        else if(b.type==="bullet"){ var items2=(b.props&&b.props.items)||[b.content||""]; items2.forEach(function(it){ txt(0.55,y,7.168,0.4,"\u2022 "+it,{color:TH.INK,size:8}); y+=0.42; }); }
        else { txt(0.55,y,7.168,Math.min(2.5,10.6-y),(b.content||"").substring(0,300),{color:TH.INK,size:8}); y+=Math.min(2.5,10.6-y)+0.15; }
      });
    }

    /* footer */
    box(0,11.38,8.268,0.31,TH.DMAROON);
    if(s.footerNote) txt(0.55,11.38,7.168,0.31,s.footerNote,{color:"FFFFFF",va:"middle",size:6.5});
  },

  a4:function(pres, slide, d, H){
    var TH=H.TH, W=8.268, M=0.55, CW=7.168;
    slide.background={color:TH.CREAM};
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:W,h:0.55,fill:{color:TH.MAROON}});
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:0.52,w:W,h:0.03,fill:{color:TH.GOLD}});
    slide.addText((d.sectionTitle||"").toUpperCase(),{x:M,y:0.08,w:CW,h:0.38,fontFace:"Cambria",fontSize:14,bold:true,color:"FFFFFF",margin:0,valign:"middle"});
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:11.38,w:W,h:0.31,fill:{color:TH.DMAROON}});
    if(d.footerNote) slide.addText(d.footerNote,{x:M,y:11.38,w:CW,h:0.31,fontFace:TH.FONT,fontSize:7.5,color:"FFFFFF",valign:"middle",margin:0});

    var blocks=d.blocks||[];
    var stats=blocks.filter(function(b){return b.type==="stat";});
    var texts=blocks.filter(function(b){return ["paragraph","headline","bullet","pullquote"].indexOf(b.type)>=0;});
    var photoB=blocks.find(function(b){return b.type==="photo"&&b.content;});
    var y=0.72;

    if(stats.length>0){
      var sw=(CW-0.15*(stats.length-1))/stats.length;
      stats.forEach(function(b,i){
        var x=M+i*(sw+0.15);
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:sw,h:0.9,rectRadius:0.08,fill:{color:TH.CARD},line:{color:TH.GOLD,width:0.75}});
        slide.addText([{text:b.content||"",options:{fontSize:H.fitText(b.content,sw-0.2,0.45,18,11),bold:true,color:TH.MAROON,breakLine:true}},
                       {text:(b.props&&b.props.label)||"",options:{fontSize:8,color:TH.MUTED}}],
          {x:x+0.08,y:y,w:sw-0.16,h:0.9,fontFace:TH.FONT,align:"center",valign:"middle",lineSpacing:13});
      });
      y+=1.05;
    }

    if(photoB){
      var PW=3.2, TW=3.62, GAP=0.25;
      var bh=10.6-y;
      H.addImg(pres,slide,photoB.content,{x:M,y:y,w:PW,h:bh,sizing:{type:"cover",w:PW,h:bh}});
      slide.addShape(pres.shapes.RECTANGLE,{x:M,y:y,w:PW,h:bh,fill:{type:"none"},line:{color:TH.GOLD,width:1.5}});
      var ty=y, tx=M+PW+GAP;
      texts.forEach(function(b){
        if(b.type==="headline"){ slide.addText((b.content||"").toUpperCase(),{x:tx,y:ty,w:TW,h:0.52,fontFace:"Cambria",fontSize:H.fitText(b.content,TW,0.5,13,9),bold:true,color:TH.DMAROON,margin:0}); ty+=0.6; }
        else if(b.type==="pullquote"){ slide.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:tx,y:ty,w:TW,h:0.9,rectRadius:0.07,fill:{color:TH.MAROON}}); slide.addText("\u201C"+(b.content||"")+"\u201D",{x:tx+0.1,y:ty+0.05,w:TW-0.2,h:0.8,fontFace:"Cambria",fontSize:9.5,italic:true,color:"FFFFFF",margin:0,align:"center",valign:"middle"}); ty+=1.0; }
        else if(b.type==="bullet"){ var items=(b.props&&b.props.items)||[b.content||""]; items.forEach(function(it){ slide.addText("\u2022",{x:tx,y:ty,w:0.2,h:0.38,fontFace:TH.FONT,fontSize:10,bold:true,color:TH.GOLD,valign:"middle",margin:0}); slide.addText(it,{x:tx+0.22,y:ty,w:TW-0.24,h:0.38,fontFace:TH.FONT,fontSize:10,color:TH.INK,valign:"middle",margin:0}); ty+=0.42; }); }
        else { slide.addText(b.content||"",{x:tx,y:ty,w:TW,h:Math.min(2.5,bh-(ty-y)),fontFace:TH.FONT,fontSize:H.fitText(b.content,TW,Math.min(2.5,bh-(ty-y)),10.5,8),color:TH.INK,margin:0,lineSpacing:15}); ty+=Math.min(2.5,bh-(ty-y))+0.15; }
      });
    } else {
      texts.forEach(function(b){
        if(b.type==="headline"){ slide.addText((b.content||"").toUpperCase(),{x:M,y:y,w:CW,h:0.52,fontFace:"Cambria",fontSize:H.fitText(b.content,CW,0.5,16,11),bold:true,color:TH.DMAROON,margin:0}); y+=0.62; }
        else if(b.type==="pullquote"){ slide.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:M+0.2,y:y,w:CW-0.4,h:0.95,rectRadius:0.07,fill:{color:TH.MAROON}}); slide.addText("\u201C"+(b.content||"")+"\u201D",{x:M+0.35,y:y+0.08,w:CW-0.7,h:0.78,fontFace:"Cambria",fontSize:11,italic:true,color:"FFFFFF",margin:0,align:"center",valign:"middle"}); y+=1.1; }
        else if(b.type==="bullet"){ var it2=(b.props&&b.props.items)||[b.content||""]; it2.forEach(function(it){ slide.addText("\u2022",{x:M,y:y,w:0.22,h:0.42,fontFace:TH.FONT,fontSize:11,bold:true,color:TH.GOLD,valign:"middle",margin:0}); slide.addText(it,{x:M+0.24,y:y,w:CW-0.26,h:0.42,fontFace:TH.FONT,fontSize:11,color:TH.INK,valign:"middle",margin:0}); y+=0.46; }); }
        else { slide.addText(b.content||"",{x:M,y:y,w:CW,h:Math.min(2.8,10.6-y),fontFace:TH.FONT,fontSize:H.fitText(b.content,CW,Math.min(2.8,10.6-y),11,8.5),color:TH.INK,margin:0,lineSpacing:16}); y+=Math.min(2.8,10.6-y)+0.18; }
      });
    }
  }
});
