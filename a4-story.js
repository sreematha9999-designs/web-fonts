/* a4-story.js — A4 story / impact / need page.
   Design matches reference: small logo top-left, gold-underlined section label,
   large DMAROON serif heading, gold rule, cream body, maroon wave footer.
   Dual editor: Flow textarea LEFT + Block list RIGHT, always live, always in sync. */

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
    var self = this;

    /* Section meta */
    var fs0 = H.fieldset("Section");
    fs0.appendChild(H.fld("Section title", s, "sectionTitle"));
    fs0.appendChild(H.fld("Footer note (optional)", s, "footerNote"));
    host.appendChild(fs0);

    /* Dual panel */
    var dual = document.createElement("div");
    dual.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;";
    host.appendChild(dual);

    /* FLOW panel */
    var flowWrap = document.createElement("fieldset");
    flowWrap.innerHTML = "<legend>FLOW — type freely</legend>";
    var flowTA = document.createElement("textarea"); flowTA.rows = 16;
    flowTA.placeholder = "Type your content here.\n\nDetected automatically:\n60% → stat (next line = label)\n• item → bullet\n\"quote\" — Name → pull quote\nALL CAPS → headline\nParagraph text flows naturally.\n\nUpload photo below.";
    flowTA.style.cssText = "width:100%;font-size:12px;line-height:1.6;resize:vertical;";
    flowTA.value = self._blocksToFlow(s.blocks || []);
    flowWrap.appendChild(flowTA);
    var photoBlock = s.blocks.find(function(b){ return b.type==='photo'; });
    if(!photoBlock){ photoBlock = {type:"photo",content:"",props:{}}; s.blocks.push(photoBlock); }
    flowWrap.appendChild(H.imgField("Photo for this page", photoBlock, "content"));
    dual.appendChild(flowWrap);

    /* BLOCK panel */
    var blockWrap = document.createElement("fieldset");
    blockWrap.innerHTML = "<legend>BLOCKS — structure</legend>";
    var blockList = document.createElement("div");
    blockWrap.appendChild(blockList);
    var addBtn = document.createElement("button"); addBtn.className = "btn ghost addbtn"; addBtn.textContent = "+ Add block";
    addBtn.onclick = function(){ s.blocks.push({type:"paragraph",content:"",primary:false,props:{}}); renderBL(); };
    blockWrap.appendChild(addBtn);
    dual.appendChild(blockWrap);

    function renderBL(){
      blockList.innerHTML = "";
      (s.blocks||[]).forEach(function(b, i){
        var row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center;gap:5px;background:#FFFDF4;border:1px solid #E5D9A8;border-radius:6px;padding:4px 6px;margin-bottom:4px;";
        var ic = document.createElement("span"); ic.style.cssText = "color:#C9A227;width:16px;flex:none;font-size:12px;";
        ic.textContent = (window.A4_BLOCKS && window.A4_BLOCKS[b.type] ? window.A4_BLOCKS[b.type].icon : "·");
        var sel = document.createElement("select"); sel.style.cssText = "font-size:11px;padding:1px 3px;flex:none;width:105px;";
        if(window.A4_BLOCKS) Object.keys(A4_BLOCKS).forEach(function(k){
          var o = document.createElement("option"); o.value = k; o.textContent = A4_BLOCKS[k].label;
          if(b.type===k) o.selected = true; sel.appendChild(o);
        });
        sel.onchange = function(){ b.type = sel.value; ic.textContent = (A4_BLOCKS[b.type]||{icon:"·"}).icon; H.refreshLight(); };
        var inp = document.createElement("input"); inp.type = "text"; inp.style.cssText = "flex:1;font-size:11px;padding:2px 4px;";
        inp.value = (b.content||"").substring(0,55); inp.placeholder = "Content…";
        inp.oninput = function(){ b.content = inp.value; H.refreshLight(); };
        var star = document.createElement("button"); star.style.cssText = "border:none;background:none;cursor:pointer;font-size:13px;";
        star.textContent = b.primary ? "★" : "☆"; star.title = "Mark as primary";
        star.onclick = function(){ (s.blocks||[]).forEach(function(x){ x.primary=false; }); b.primary=true; renderBL(); H.refreshLight(); };
        var del = document.createElement("button"); del.className = "delrow"; del.textContent = "✕";
        del.onclick = function(){ s.blocks.splice(i,1); renderBL(); H.refreshLight(); };
        row.appendChild(ic); row.appendChild(sel); row.appendChild(inp); row.appendChild(star); row.appendChild(del);
        blockList.appendChild(row);
      });
    }
    renderBL();

    /* Sync flow → blocks */
    var t;
    flowTA.addEventListener("input", function(){
      clearTimeout(t); t = setTimeout(function(){
        var det = window.A4_detect ? A4_detect(flowTA.value) : [];
        var photo = (s.blocks||[]).find(function(b){ return b.type==='photo' && b.content; });
        s.blocks = det; if(photo) s.blocks.push(photo);
        renderBL(); H.refreshLight();
      }, 600);
    });
  },

  _blocksToFlow:function(blocks){
    return (blocks||[]).filter(function(b){ return b.type !== 'photo'; }).map(function(b){
      if(b.type==='headline')  return (b.content||"").toUpperCase();
      if(b.type==='stat')      return (b.content||"") + ((b.props&&b.props.label) ? "\n"+b.props.label : "");
      if(b.type==='pullquote') return "\u201C"+(b.content||"")+"\u201D"+((b.props&&b.props.attribution)?" \u2014 "+b.props.attribution:"");
      if(b.type==='bullet')    return ((b.props&&b.props.items)||[b.content||""]).map(function(i){ return "\u2022 "+i; }).join("\n");
      if(b.type==='divider')   return "---";
      return b.content || "";
    }).filter(Boolean).join("\n\n");
  },

  /* ── PREVIEW ─────────────────────────────────────────────────────────── */
  preview:function(s, host, H){
    var TH = H.TH;
    var PW = 8.268, PH = 11.693;

    /* CRITICAL: font sizes use 0.138 multiplier — same as landscape fsz()
       but for A4 width. This makes text proportional to the A4 page, not the element. */
    function fsz(pt){ return (pt * 0.138) + "cqw"; }

    function box(x, y, w, h, bg, extra){
      var d = document.createElement("div");
      d.style.position = "absolute";
      d.style.left   = (x / PW * 100) + "%";
      d.style.top    = (y / PH * 100) + "%";
      d.style.width  = (w / PW * 100) + "%";
      d.style.height = (h / PH * 100) + "%";
      if(bg) d.style.background = "#" + bg;
      if(extra) Object.assign(d.style, extra);
      host.appendChild(d); return d;
    }
    function txt(x, y, w, h, text, opts){
      var o = opts || {};
      var d = box(x, y, w, h, null, {
        display:"flex",
        alignItems:  o.va==="middle"?"center": o.va==="bottom"?"flex-end":"flex-start",
        justifyContent: o.align==="center"?"center": o.align==="right"?"flex-end":"flex-start",
        overflow:"hidden", padding:"0 1%",
        fontSize: fsz(o.size || 9),
        fontWeight: o.bold ? "700" : "400",
        fontStyle:  o.italic ? "italic" : "normal",
        color: "#" + (o.color || TH.INK),
        fontFamily: o.serif ? "Cambria,Georgia,serif" : "Arial,sans-serif",
        lineHeight: "1.35", whiteSpace: "pre-line", wordBreak: "break-word"
      });
      d.textContent = text || ""; return d;
    }

    host.style.background = "#" + TH.CREAM;

    /* ── Logo top-left ── */
    var logoC = box(0.45, 0.18, 0.48, 0.48, TH.MAROON, {
      borderRadius:"50%", border:"1.5px solid #"+TH.GOLD,
      display:"flex", alignItems:"center", justifyContent:"center"
    });
    logoC.style.fontSize = fsz(3.5); logoC.style.color="#fff"; logoC.style.fontWeight="700"; logoC.style.textAlign="center";
    logoC.textContent = "OWOF";
    txt(1.05, 0.22, 3.5, 0.42, "ONE WORLD ONE FAMILY MISSION",
        {bold:true, color:TH.MAROON, size:6.5, va:"middle"});

    /* ── Section label (small caps above heading) ── */
    txt(0.55, 0.82, 7.168, 0.28,
        (s.sectionTitle||"").toUpperCase(),
        {bold:true, color:TH.MUTED, size:7.5});

    /* Gold rule */
    box(0.55, 1.12, 7.168, 0.025, TH.GOLD);

    var blocks = s.blocks || [];
    var stats  = blocks.filter(function(b){ return b.type==="stat"; });
    var texts  = blocks.filter(function(b){ return ["paragraph","headline","bullet","pullquote"].indexOf(b.type)>=0; });
    var photoB = blocks.find(function(b){ return b.type==="photo" && b.content; });

    var y = 1.20;

    /* ── Headline (first one becomes the page heading) ── */
    var headlineB = texts.find(function(b){ return b.type==="headline"; });
    if(headlineB){
      var hl = headlineB.content || "";
      var hlFsz = hl.length > 50 ? 14 : hl.length > 30 ? 17 : 20;
      txt(0.55, y, 7.168, 0.80, hl.toUpperCase(),
          {bold:true, color:TH.DMAROON, size:hlFsz, serif:true});
      y += 0.88;
      texts = texts.filter(function(b){ return b!==headlineB; });
    }

    /* ── Stat cards ── */
    if(stats.length > 0){
      var gap = 0.12;
      var sw = (7.168 - gap*(stats.length-1)) / stats.length;
      stats.forEach(function(b, i){
        var sx = 0.55 + i*(sw+gap);
        box(sx, y, sw, 0.82, TH.CARD,
            {border:"1px solid #"+TH.GOLD, borderRadius:"5px",
             boxShadow:"0 1px 4px rgba(0,0,0,.10)"});
        txt(sx, y+0.05, sw, 0.46, b.content||"",
            {bold:true, color:TH.MAROON, size:18, align:"center", va:"middle"});
        txt(sx, y+0.52, sw, 0.26, (b.props&&b.props.label)||"",
            {color:TH.MUTED, size:7, align:"center"});
      });
      y += 1.00;
    }

    /* ── Body content: photo left + text right, OR full-width text ── */
    var bodyBottom = 10.62;

    if(photoB){
      var phW = 3.10, txW = 3.72, phGap = 0.26;
      var phH = bodyBottom - y;
      /* Photo */
      box(0.55, y, phW, phH, "E8E0CC", {
        backgroundImage: "url('"+(photoB.content||"")+"')",
        backgroundSize:"cover", backgroundPosition:"center",
        border:"1.5px solid #"+TH.GOLD, borderRadius:"4px"
      });
      /* Text column */
      var ty = y, tx = 0.55 + phW + phGap;
      texts.forEach(function(b){
        var remaining = bodyBottom - ty - 0.05;
        if(remaining < 0.25) return;
        if(b.type==="pullquote"){
          var qh = Math.min(1.0, remaining);
          box(tx, ty, txW, qh, TH.MAROON, {borderRadius:"5px"});
          txt(tx+0.1, ty+0.08, txW-0.2, qh-0.16,
              "\u201C"+(b.content||"")+"\u201D",
              {italic:true, color:"FFFFFF", size:8.5, va:"middle"});
          if(b.props&&b.props.attribution)
            txt(tx+0.1, ty+qh-0.20, txW-0.2, 0.18,
                "— "+(b.props.attribution||""),
                {bold:true, color:"FFFFFF", size:7, align:"right"});
          ty += qh + 0.12;
        } else if(b.type==="bullet"){
          var items = (b.props&&b.props.items)||[b.content||""];
          items.forEach(function(it){
            if(bodyBottom-ty<0.25) return;
            txt(tx, ty, txW, 0.36, "\u2022  "+it, {color:TH.INK, size:8.5});
            ty += 0.38;
          });
        } else {
          var ph2 = Math.min(2.8, remaining);
          txt(tx, ty, txW, ph2, b.content||"", {color:TH.INK, size:8.5});
          ty += ph2 + 0.14;
        }
      });
    } else {
      /* Full width */
      texts.forEach(function(b){
        var remaining = bodyBottom - y - 0.05;
        if(remaining < 0.25) return;
        if(b.type==="pullquote"){
          var qh2 = Math.min(1.05, remaining);
          box(0.70, y, 6.85, qh2, TH.MAROON, {borderRadius:"5px"});
          txt(0.85, y+0.10, 6.55, qh2-0.20,
              "\u201C"+(b.content||"")+"\u201D",
              {italic:true, color:"FFFFFF", size:9, align:"center", va:"middle"});
          if(b.props&&b.props.attribution)
            txt(0.85, y+qh2-0.22, 6.55, 0.18,
                "— "+(b.props.attribution||""),
                {bold:true, color:"FFFFFF", size:7.5, align:"right"});
          y += qh2 + 0.14;
        } else if(b.type==="bullet"){
          var items2 = (b.props&&b.props.items)||[b.content||""];
          items2.forEach(function(it){
            if(bodyBottom-y<0.25) return;
            txt(0.55, y, 7.168, 0.38, "\u2022  "+it, {color:TH.INK, size:9});
            y += 0.40;
          });
        } else {
          var ph3 = Math.min(3.0, remaining);
          txt(0.55, y, 7.168, ph3, b.content||"", {color:TH.INK, size:9});
          y += ph3 + 0.16;
        }
      });
    }

    /* ── Footer wave ── */
    box(0, 10.72, PW, 0.97, TH.DMAROON, {borderRadius:"60% 60% 0 0 / 30% 30% 0 0"});
    if(s.footerNote){
      txt(0.55, 10.85, 7.168, 0.40, s.footerNote,
          {color:"FFFFFF", size:7, va:"middle", align:"center"});
    }
  },

  /* ── A4 PPTX ──────────────────────────────────────────────────────────── */
  a4:function(pres, slide, d, H){
    var TH = H.TH, W = 8.268, M = 0.55, CW = 7.168;
    slide.background = {color: TH.CREAM};

    /* Logo */
    slide.addShape(pres.shapes.OVAL, {x:M, y:0.18, w:0.48, h:0.48,
      fill:{color:TH.MAROON}, line:{color:TH.GOLD, width:1.5}});
    var bl = TH.BRAND.map(function(t,i){ return {text:t, options:{breakLine:i<TH.BRAND.length-1}}; });
    slide.addText(bl, {x:M, y:0.18, w:0.48, h:0.48,
      fontFace:TH.FONT, fontSize:4.5, bold:true, color:"FFFFFF",
      align:"center", valign:"middle", margin:0});
    slide.addText("ONE WORLD ONE FAMILY MISSION", {
      x:1.10, y:0.22, w:3.5, h:0.38,
      fontFace:TH.FONT, fontSize:7.5, bold:true, color:TH.MAROON,
      valign:"middle", margin:0});

    /* Section label */
    slide.addText((d.sectionTitle||"").toUpperCase(), {
      x:M, y:0.82, w:CW, h:0.28,
      fontFace:TH.FONT, fontSize:8, bold:true, color:TH.MUTED, margin:0});

    /* Gold rule */
    slide.addShape(pres.shapes.RECTANGLE, {x:M, y:1.12, w:CW, h:0.025,
      fill:{color:TH.GOLD}, line:{color:TH.GOLD, pt:0}});

    /* Footer wave */
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x:0, y:10.82, w:W, h:0.87, rectRadius:0.5,
      fill:{color:TH.DMAROON}, line:{color:TH.DMAROON, pt:0}});
    if(d.footerNote)
      slide.addText(d.footerNote, {x:M, y:10.82, w:CW, h:0.87,
        fontFace:TH.FONT, fontSize:8, color:"FFFFFF",
        align:"center", valign:"middle", margin:0});

    var blocks = d.blocks || [];
    var stats  = blocks.filter(function(b){ return b.type==="stat"; });
    var texts  = blocks.filter(function(b){ return ["paragraph","headline","bullet","pullquote"].indexOf(b.type)>=0; });
    var photoB = blocks.find(function(b){ return b.type==="photo" && b.content; });
    var y = 1.20;

    /* Headline as page heading */
    var headlineB = texts.find(function(b){ return b.type==="headline"; });
    if(headlineB){
      var hl = headlineB.content||"";
      var hlFsz = hl.length>50?16:hl.length>30?20:24;
      slide.addText(hl.toUpperCase(), {
        x:M, y:y, w:CW, h:0.80,
        fontFace:"Cambria", fontSize:hlFsz, bold:true, color:TH.DMAROON,
        valign:"top", margin:0});
      y += 0.88;
      texts = texts.filter(function(b){ return b!==headlineB; });
    }

    /* Stat cards */
    if(stats.length > 0){
      var gap = 0.12, sw = (CW - gap*(stats.length-1)) / stats.length;
      stats.forEach(function(b, i){
        var sx = M + i*(sw+gap);
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
          x:sx, y:y, w:sw, h:0.82, rectRadius:0.07,
          fill:{color:TH.CARD}, line:{color:TH.GOLD, width:0.75}});
        slide.addText([
          {text:b.content||"", options:{fontSize:H.fitText(b.content,sw-0.2,0.44,20,13), bold:true, color:TH.MAROON, breakLine:true}},
          {text:(b.props&&b.props.label)||"", options:{fontSize:8, color:TH.MUTED}}
        ], {x:sx+0.06, y:y, w:sw-0.12, h:0.82,
            fontFace:TH.FONT, align:"center", valign:"middle", lineSpacing:14});
      });
      y += 1.00;
    }

    var bodyBottom = 10.60;

    if(photoB){
      var phW=3.10, txW=3.62, phGap=0.26, phH=bodyBottom-y;
      H.addImg(pres, slide, photoB.content, {x:M, y:y, w:phW, h:phH,
        sizing:{type:"cover", w:phW, h:phH}});
      slide.addShape(pres.shapes.RECTANGLE, {x:M, y:y, w:phW, h:phH,
        fill:{type:"none"}, line:{color:TH.GOLD, width:1.5}});
      var ty=y, tx=M+phW+phGap;
      texts.forEach(function(b){
        var rem = bodyBottom - ty - 0.05; if(rem<0.25) return;
        if(b.type==="pullquote"){
          var qh=Math.min(1.1,rem);
          slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {x:tx,y:ty,w:txW,h:qh,rectRadius:0.07,fill:{color:TH.MAROON}});
          slide.addText("\u201C"+(b.content||"")+"\u201D",{x:tx+0.1,y:ty+0.06,w:txW-0.2,h:qh-0.12,fontFace:"Cambria",fontSize:9.5,italic:true,color:"FFFFFF",margin:0,align:"center",valign:"middle"});
          ty+=qh+0.12;
        } else if(b.type==="bullet"){
          var items=(b.props&&b.props.items)||[b.content||""];
          items.forEach(function(it){
            if(bodyBottom-ty<0.25) return;
            slide.addText("\u2022",{x:tx,y:ty,w:0.22,h:0.40,fontFace:TH.FONT,fontSize:11,bold:true,color:TH.GOLD,valign:"middle",margin:0});
            slide.addText(it,{x:tx+0.24,y:ty,w:txW-0.26,h:0.40,fontFace:TH.FONT,fontSize:H.fitText(it,txW-0.26,0.38,10.5,8),color:TH.INK,valign:"middle",margin:0});
            ty+=0.44;
          });
        } else {
          var ph=Math.min(2.8,rem);
          slide.addText(b.content||"",{x:tx,y:ty,w:txW,h:ph,fontFace:TH.FONT,fontSize:H.fitText(b.content,txW,ph,11,8.5),color:TH.INK,margin:0,lineSpacing:15});
          ty+=ph+0.14;
        }
      });
    } else {
      texts.forEach(function(b){
        var rem=bodyBottom-y-0.05; if(rem<0.25) return;
        if(b.type==="pullquote"){
          var qh2=Math.min(1.1,rem);
          slide.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:M+0.18,y:y,w:CW-0.36,h:qh2,rectRadius:0.07,fill:{color:TH.MAROON}});
          slide.addText("\u201C"+(b.content||"")+"\u201D",{x:M+0.32,y:y+0.08,w:CW-0.64,h:qh2-0.16,fontFace:"Cambria",fontSize:11,italic:true,color:"FFFFFF",margin:0,align:"center",valign:"middle"});
          y+=qh2+0.14;
        } else if(b.type==="bullet"){
          var it2=(b.props&&b.props.items)||[b.content||""];
          it2.forEach(function(it){
            if(bodyBottom-y<0.25) return;
            slide.addText("\u2022",{x:M,y:y,w:0.22,h:0.44,fontFace:TH.FONT,fontSize:12,bold:true,color:TH.GOLD,valign:"middle",margin:0});
            slide.addText(it,{x:M+0.24,y:y,w:CW-0.26,h:0.44,fontFace:TH.FONT,fontSize:H.fitText(it,CW-0.26,0.42,11,8.5),color:TH.INK,valign:"middle",margin:0});
            y+=0.48;
          });
        } else {
          var ph4=Math.min(3.0,rem);
          slide.addText(b.content||"",{x:M,y:y,w:CW,h:ph4,fontFace:TH.FONT,fontSize:H.fitText(b.content,CW,ph4,11,8.5),color:TH.INK,margin:0,lineSpacing:16});
          y+=ph4+0.16;
        }
      });
    }
  }
});
