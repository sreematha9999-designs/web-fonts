/* a4-story.js — A4 story/impact page. Both Flow + Block mode.
   Layout engine decides placement based on block combination.
   Used for: problem page, solution page, impact page, about page. */
OWOF.registerA4Template({
  type:"a4-story", label:"Story / impact page",
  docTypes:["csr","fundraising","annual-report"],

  defaults:function(){
    return {type:"a4-story",
      sectionTitle:"The Need",
      blocks:[
        {type:"headline", content:"TRANSFORMING LIVES THROUGH HEALTHCARE", primary:false, props:{}},
        {type:"stat",     content:"60%", primary:true,  props:{label:"Overall Progress"}},
        {type:"paragraph",content:"The Sai Sharanam Girls Hostel provides safe, modern accommodation for nursing students at Sri Madhusudan Sai Institute of Medical Sciences and Research. With a G+3 structure nearing completion, this facility will house 200+ students and transform the pipeline of healthcare professionals in the region.", primary:false, props:{}},
        {type:"pullquote",content:"Every room built is a future doctor housed, a life changed.", primary:false, props:{attribution:"Project Vision, OWOF"}},
        {type:"photo",    content:"", primary:false, props:{label:"Site photo — building progress"}},
      ],
      footerNote:""};
  },

  editor:function(s, host, H){
    var self=this;
    /* Section title */
    var fs0=H.fieldset("Section");
    fs0.appendChild(H.fld("Section title (top of page)", s, "sectionTitle"));
    host.appendChild(fs0);

    /* Dual panel: Flow left + Block right */
    var dual=document.createElement("div");
    dual.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:12px;";
    host.appendChild(dual);

    /* ── FLOW PANEL ── */
    var flowWrap=document.createElement("div");
    var flowLabel=document.createElement("div");
    flowLabel.style.cssText="font-size:11px;font-weight:700;color:#8B1414;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;";
    flowLabel.textContent="Flow — type freely";
    var flowTA=document.createElement("textarea");
    flowTA.rows=18;
    flowTA.placeholder='Type or paste your content here.\n\nEngine detects:\n"60%" → stat\n"• item" → bullet\n""quote" — Name" → pull quote\nALL CAPS LINE → headline\nOr just write paragraphs.\n\n[Upload photo below]';
    flowTA.style.cssText="width:100%;font-size:12px;line-height:1.6;resize:vertical;";
    /* populate flow from current blocks */
    flowTA.value=self._blocksToFlow(s.blocks||[]);
    flowWrap.appendChild(flowLabel);
    flowWrap.appendChild(flowTA);
    /* photo upload under flow */
    var photoWrap=document.createElement("div");
    photoWrap.style.marginTop="8px";
    var photoBlock=(s.blocks||[]).find(function(b){return b.type==='photo';});
    if(!photoBlock){ photoBlock={type:"photo",content:"",primary:false,props:{label:"Photo"}}; }
    photoWrap.appendChild(H.imgField("Photo (optional)", photoBlock, "content"));
    flowWrap.appendChild(photoWrap);
    dual.appendChild(flowWrap);

    /* ── BLOCK PANEL ── */
    var blockWrap=document.createElement("div");
    var blockLabel=document.createElement("div");
    blockLabel.style.cssText="font-size:11px;font-weight:700;color:#8B1414;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;";
    blockLabel.textContent="Blocks — structure";
    blockWrap.appendChild(blockLabel);
    var blockList=document.createElement("div");
    blockList.id="a4-block-list-"+Math.random().toString(36).slice(2,6);
    blockWrap.appendChild(blockList);
    var addBtn=document.createElement("button");
    addBtn.className="btn ghost addbtn"; addBtn.textContent="+ Add block";
    addBtn.onclick=function(){
      s.blocks.push({type:"paragraph",content:"",primary:false,props:{}});
      renderBlockList();
    };
    blockWrap.appendChild(addBtn);
    dual.appendChild(blockWrap);

    /* Sync: flow → blocks (with debounce) */
    var syncTimer;
    flowTA.addEventListener("input",function(){
      clearTimeout(syncTimer);
      syncTimer=setTimeout(function(){
        var detected=A4_detect(flowTA.value);
        /* preserve photo block */
        var photo=(s.blocks||[]).find(function(b){return b.type==='photo';});
        s.blocks=detected;
        if(photo&&photo.content) s.blocks.push(photo);
        renderBlockList();
        H.refreshLight();
      },600);
    });

    /* Block panel renderer */
    function renderBlockList(){
      blockList.innerHTML="";
      (s.blocks||[]).forEach(function(b,i){
        var row=document.createElement("div");
        row.style.cssText="display:flex;align-items:center;gap:6px;background:#FFFDF4;border:1px solid #E5D9A8;border-radius:6px;padding:5px 7px;margin-bottom:5px;";

        /* type icon */
        var ic=document.createElement("span");
        ic.style.cssText="font-size:13px;color:#C9A227;width:18px;flex:none;";
        ic.textContent=(A4_BLOCKS[b.type]||{icon:"·"}).icon;
        row.appendChild(ic);

        /* type selector */
        var sel=document.createElement("select");
        sel.style.cssText="font-size:11px;padding:2px 4px;flex:none;width:110px;";
        Object.keys(A4_BLOCKS).forEach(function(k){
          var o=document.createElement("option"); o.value=k; o.textContent=A4_BLOCKS[k].label;
          if(b.type===k) o.selected=true; sel.appendChild(o);
        });
        sel.onchange=function(){ b.type=sel.value; H.refreshLight(); };
        row.appendChild(sel);

        /* content preview / edit */
        var inp=document.createElement("input"); inp.type="text";
        inp.style.cssText="flex:1;font-size:11px;padding:2px 5px;";
        inp.value=(b.content||'').substring(0,60);
        inp.placeholder="Content…";
        inp.oninput=function(){ b.content=inp.value; H.refreshLight(); };
        row.appendChild(inp);

        /* primary star */
        var star=document.createElement("button");
        star.title="Mark as primary (most prominent)";
        star.style.cssText="border:none;background:none;cursor:pointer;font-size:14px;padding:0 2px;";
        star.textContent=b.primary?"★":"☆";
        star.onclick=function(){
          (s.blocks||[]).forEach(function(x){x.primary=false;}); b.primary=!b.primary||true;
          renderBlockList(); H.refreshLight();
        };
        row.appendChild(star);

        /* delete */
        var del=document.createElement("button");
        del.className="delrow"; del.textContent="✕";
        del.onclick=function(){ s.blocks.splice(i,1); renderBlockList(); H.refreshLight(); };
        row.appendChild(del);

        blockList.appendChild(row);

        /* sync block edit back to flow panel */
        inp.addEventListener("blur",function(){
          flowTA.value=self._blocksToFlow(s.blocks);
        });
      });
    }
    renderBlockList();
  },

  /* Convert blocks → flow text for sync */
  _blocksToFlow:function(blocks){
    return (blocks||[]).map(function(b){
      switch(b.type){
        case 'headline':    return (b.content||'').toUpperCase();
        case 'stat':        return (b.content||'')+'\n'+((b.props&&b.props.label)||'');
        case 'pullquote':   return '\u201C'+(b.content||'')+'\u201D'+(b.props&&b.props.attribution?' \u2014 '+b.props.attribution:'');
        case 'bullet':      return ((b.props&&b.props.items)||[]).map(function(i){return '• '+i;}).join('\n');
        case 'divider':     return '---';
        case 'photo':       return b.content?'[photo: '+(b.content||'').substring(0,40)+'...]':'';
        default:            return b.content||'';
      }
    }).filter(Boolean).join('\n\n');
  },

  /* A4 PPTX renderer — layout engine drives placement */
  a4:function(pres, slide, d, H){
    var TH=H.TH, W=8.268, PH=11.693, M=0.55, CW=7.168;
    slide.background={color:TH.CREAM};

    /* Header */
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:W,h:0.55,fill:{color:TH.MAROON}});
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:0.52,w:W,h:0.03,fill:{color:TH.GOLD}});
    slide.addText((d.sectionTitle||"").toUpperCase(),{x:M,y:0.08,w:CW,h:0.38,
      fontFace:"Cambria",fontSize:14,bold:true,color:"FFFFFF",margin:0,valign:"middle"});

    /* Footer */
    slide.addShape(pres.shapes.RECTANGLE,{x:0,y:11.38,w:W,h:0.31,fill:{color:TH.DMAROON}});
    if(d.footerNote) slide.addText(d.footerNote,{x:M,y:11.38,w:CW,h:0.31,
      fontFace:TH.FONT,fontSize:7.5,color:"FFFFFF",valign:"middle",margin:0});

    /* Content zone: y=0.65, h=10.55 */
    var blocks=A4_engine.inferPrimary(d.blocks||[]);
    var hasPhoto=blocks.some(function(b){return b.type==='photo'&&b.content;});
    var hasStat=blocks.some(function(b){return b.type==='stat'||b.type==='statgroup';});
    var textBlocks=blocks.filter(function(b){return ['paragraph','headline','bullet','pullquote'].indexOf(b.type)>=0;});
    var visualBlocks=blocks.filter(function(b){return ['photo','diagram','chart'].indexOf(b.type)>=0;});
    var dataBlocks=blocks.filter(function(b){return ['stat','statgroup','progressbar','callout'].indexOf(b.type)>=0;});

    var y=0.72;

    /* Stats row at top if present */
    if(dataBlocks.length>0&&dataBlocks.length<=5){
      var sw=(CW-0.2*(dataBlocks.length-1))/dataBlocks.length;
      dataBlocks.forEach(function(b,i){
        var x=M+i*(sw+0.2);
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:sw,h:1.0,rectRadius:0.08,
          fill:{color:TH.CARD},line:{color:TH.GOLD,width:0.75}});
        slide.addText([{text:b.content||"",options:{fontSize:H.fitText(b.content,sw-0.2,0.5,20,12),bold:true,color:TH.MAROON,breakLine:true}},
                       {text:(b.props&&b.props.label)||"",options:{fontSize:8.5,color:TH.MUTED}}],
          {x:x+0.1,y:y,w:sw-0.2,h:1.0,fontFace:TH.FONT,align:"center",valign:"middle",lineSpacing:14});
      });
      y+=1.15;
    }

    /* Layout: photo+text side by side, or stacked */
    if(hasPhoto&&textBlocks.length>0){
      var photoB=visualBlocks.find(function(b){return b.type==='photo';});
      var PW=CW*0.45, TW=CW*0.52, gap=CW-PW-TW;
      var bodyH=10.4-y;
      /* photo left */
      if(photoB.content){
        H.addImg(pres,slide,photoB.content,{x:M,y:y,w:PW,h:bodyH,sizing:{type:"cover",w:PW,h:bodyH}});
        slide.addShape(pres.shapes.RECTANGLE,{x:M,y:y,w:PW,h:bodyH,fill:{type:"none"},line:{color:TH.GOLD,width:1.5}});
      } else {
        H.placeholderBox(pres,slide,M,y,PW,bodyH,"Photo");
      }
      /* text right */
      var ty=y, tx=M+PW+gap;
      textBlocks.forEach(function(b){
        var bh=Math.min(A4_engine.naturalHeight(b,TW)*1.1, bodyH*0.4);
        switch(b.type){
          case 'headline':
            slide.addText(b.content||"",{x:tx,y:ty,w:TW,h:Math.min(bh,0.7),fontFace:"Cambria",
              fontSize:H.fitText(b.content,TW,0.65,16,11),bold:true,color:TH.DMAROON,margin:0});
            ty+=Math.min(bh,0.75);
            break;
          case 'pullquote':
            slide.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:tx,y:ty,w:TW,h:Math.min(bh,1.2),
              rectRadius:0.07,fill:{color:TH.MAROON}});
            slide.addText('\u201C'+(b.content||"")+'\u201D',{x:tx+0.12,y:ty+0.1,w:TW-0.24,h:Math.min(bh,1.0),
              fontFace:"Cambria",fontSize:11,italic:true,color:"FFFFFF",margin:0});
            ty+=Math.min(bh,1.3);
            break;
          case 'bullet':
            var items=(b.props&&b.props.items)||[b.content||""];
            items.forEach(function(item){
              slide.addText("\u2022",{x:tx,y:ty,w:0.22,h:0.38,fontFace:TH.FONT,fontSize:10,bold:true,color:TH.GOLD,valign:"middle",margin:0});
              slide.addText(item,{x:tx+0.24,y:ty,w:TW-0.26,h:0.38,fontFace:TH.FONT,fontSize:10,color:TH.INK,valign:"middle",margin:0});
              ty+=0.4;
            });
            ty+=0.1;
            break;
          default: /* paragraph */
            slide.addText(b.content||"",{x:tx,y:ty,w:TW,h:Math.min(bh,3.5),fontFace:TH.FONT,
              fontSize:10.5,color:TH.INK,margin:0,lineSpacing:15});
            ty+=Math.min(bh,3.5)+0.15;
        }
      });
    } else {
      /* No photo, or only text — full width flow */
      var items=A4_engine.pack(textBlocks,{x:M,y:y,w:CW,h:10.4-y});
      items.forEach(function(item){
        var b=item.block;
        switch(b.type){
          case 'headline':
            slide.addText(b.content||"",{x:item.x,y:item.y,w:item.w,h:item.h,fontFace:"Cambria",
              fontSize:H.fitText(b.content,item.w,item.h,18,12),bold:true,color:TH.DMAROON,margin:0});
            break;
          case 'pullquote':
            slide.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:item.x+0.2,y:item.y,w:item.w-0.4,h:item.h,
              rectRadius:0.07,fill:{color:TH.MAROON}});
            slide.addText('\u201C'+(b.content||"")+'\u201D',{x:item.x+0.35,y:item.y+0.1,w:item.w-0.7,h:item.h-0.15,
              fontFace:"Cambria",fontSize:12,italic:true,color:"FFFFFF",margin:0,align:"center",valign:"middle"});
            break;
          case 'bullet':
            var items2=(b.props&&b.props.items)||[b.content||""];
            var byy=item.y;
            items2.forEach(function(it){
              slide.addText("\u2022",{x:item.x,y:byy,w:0.22,h:0.42,fontFace:TH.FONT,fontSize:11,bold:true,color:TH.GOLD,valign:"middle",margin:0});
              slide.addText(it,{x:item.x+0.24,y:byy,w:item.w-0.26,h:0.42,fontFace:TH.FONT,fontSize:11,color:TH.INK,valign:"middle",margin:0});
              byy+=0.44;
            });
            break;
          default:
            slide.addText(b.content||"",{x:item.x,y:item.y,w:item.w,h:item.h,fontFace:TH.FONT,
              fontSize:H.fitText(b.content,item.w,item.h,11.5,9),color:TH.INK,margin:0,lineSpacing:16});
        }
      });
    }
  },

  /* PREVIEW */
  preview:function(s, host, H){
    var PV=H.pv, TH=H.TH, W=8.268, PH=11.693;
    var sx=10/W, sy=5.625/PH;
    function sc(v,dir){ return v*(dir==='x'?sx:sy); }

    /* header */
    PV.box(host,{x:0,y:0,w:10,h:sc(0.55,'y'),bg:TH.MAROON});
    PV.box(host,{x:0,y:sc(0.52,'y'),w:10,h:sc(0.03,'y'),bg:TH.GOLD});
    PV.text(host,{x:sc(0.55,'x'),y:sc(0.08,'y'),w:sc(7.168,'x'),h:sc(0.38,'y'),
      text:(s.sectionTitle||"").toUpperCase(),size:10,bold:true,color:"FFFFFF",valign:"middle"});

    var blocks=s.blocks||[];
    var hasPhoto=blocks.some(function(b){return b.type==='photo'&&b.content;});
    var stats=blocks.filter(function(b){return b.type==='stat';});
    var texts=blocks.filter(function(b){return ['paragraph','headline','bullet','pullquote'].indexOf(b.type)>=0;});
    var photoB=blocks.find(function(b){return b.type==='photo';});

    var y=sc(0.72,'y');

    /* stats row */
    if(stats.length>0){
      var sw=sc(7.168,'x')/(stats.length);
      stats.forEach(function(b,i){
        var x=sc(0.55,'x')+i*sw;
        PV.box(host,{x:x,y:y,w:sw-sc(0.1,'x'),h:sc(1.0,'y'),bg:TH.CARD,line:TH.GOLD,radius:true});
        PV.rich(host,{x:x+sc(0.1,'x'),y:y,w:sw-sc(0.2,'x'),h:sc(1.0,'y'),align:"center",valign:"middle"},[
          {text:b.content||"",size:14,bold:true,color:TH.MAROON,block:true},
          {text:(b.props&&b.props.label)||"",size:6.5,color:TH.MUTED,block:true}]);
      });
      y+=sc(1.15,'y');
    }

    /* photo + text or text only */
    if(hasPhoto&&photoB&&photoB.content&&texts.length>0){
      var PW=sc(3.2,'x'), TW=sc(3.7,'x'), gap=sc(0.27,'x');
      var bh=sc(10.4,'y')-y;
      PV.img(host,{x:sc(0.55,'x'),y:y,w:PW,h:bh,src:photoB.content});
      var ty=y, tx=sc(0.55,'x')+PW+gap;
      texts.forEach(function(b){
        if(b.type==='headline'){ PV.text(host,{x:tx,y:ty,w:TW,h:sc(0.65,'y'),text:b.content||"",size:9,bold:true,color:TH.DMAROON}); ty+=sc(0.72,'y'); }
        else if(b.type==='pullquote'){ PV.box(host,{x:tx,y:ty,w:TW,h:sc(0.9,'y'),bg:TH.MAROON,radius:true}); ty+=sc(1.0,'y'); }
        else { PV.text(host,{x:tx,y:ty,w:TW,h:Math.min(sc(2.5,'y'),bh-ty+y),text:(b.content||"").substring(0,120),size:7.5,color:TH.INK}); ty+=sc(1.2,'y'); }
      });
    } else {
      var ty2=y;
      texts.forEach(function(b){
        if(b.type==='pullquote'){
          PV.box(host,{x:sc(0.75,'x'),y:ty2,w:sc(6.5,'x'),h:sc(0.8,'y'),bg:TH.MAROON,radius:true});
          ty2+=sc(0.92,'y');
        } else {
          PV.text(host,{x:sc(0.55,'x'),y:ty2,w:sc(7.168,'x'),h:sc(0.7,'y'),
            text:(b.content||"").substring(0,100),size:b.type==='headline'?9:7.5,
            bold:b.type==='headline',color:b.type==='headline'?TH.DMAROON:TH.INK});
          ty2+=sc(0.8,'y');
        }
      });
    }

    /* footer */
    PV.box(host,{x:0,y:sc(11.38,'y'),w:10,h:sc(0.31,'y'),bg:TH.DMAROON});
  }
});
