/* core/app.js — the single source of truth.
   Owns: deck state, template registry, tray, editor host, preview host,
   save/load .json, PPTX build orchestration, image downscaling.
   Templates NEVER touch each other; they implement 4 functions:
   defaults(), editor(slide, host, H), preview(slide, host, H), pptx(pres, pptSlide, slide, H). */
"use strict";
(function(){

const OWOF = {
  theme: null,
  templates: {},
  order: [],
  slides: [],
  selected: -1,
  registerTheme(t){ this.theme = t; },
  registerTemplate(def){
    if(!def || !def.type) return;
    this.templates[def.type] = def;
    if(this.order.indexOf(def.type) < 0) this.order.push(def.type);
  }
};
window.OWOF = OWOF;

/* ============================================================
   H — the helper kit handed to every template
   ============================================================ */
const H = {};
OWOF.H = H;
Object.defineProperty(H, "TH", { get: () => OWOF.theme });

/* ---------- refreshers ---------- */
H.refreshLight = function(){ renderTray(); renderPreview(); };          // text edits
H.refreshAll   = function(){ renderTray(); renderEditor(); renderPreview(); }; // structural edits (add/remove row)

/* ---------- editor form helpers ---------- */
H.fieldset = function(title){
  const fs = document.createElement("fieldset");
  fs.innerHTML = '<legend></legend>';
  fs.querySelector("legend").textContent = title;
  return fs;
};
H.fld = function(label, obj, key, opts){
  const o = opts || {};
  const wrap = document.createElement("div");
  const lab = document.createElement("label"); lab.textContent = label; wrap.appendChild(lab);
  let inp;
  if(o.area){ inp = document.createElement("textarea"); inp.rows = o.rows || 3; }
  else { inp = document.createElement("input"); inp.type = "text"; }
  inp.value = obj[key] == null ? "" : obj[key];
  inp.addEventListener("input", function(){ obj[key] = inp.value; H.refreshLight(); });
  wrap.appendChild(inp);
  return wrap;
};

/* image field: upload (auto-downscaled) OR a repo path like images/wing1.jpg */
H.imgField = function(label, obj, key){
  const wrap = document.createElement("div");
  const lab = document.createElement("label"); lab.textContent = label; wrap.appendChild(lab);
  const slot = document.createElement("div"); slot.className = "imgslot";
  const file = document.createElement("input"); file.type = "file"; file.accept = "image/*";
  const orL  = document.createElement("span"); orL.textContent = "or"; orL.className = "orlbl";
  const path = document.createElement("input"); path.type = "text"; path.placeholder = "images/photo.jpg (file in your repo)";
  const prev = document.createElement("img"); prev.alt = "preview";
  const clr  = document.createElement("button"); clr.type = "button"; clr.className = "btn ghost mini2"; clr.textContent = "Remove";

  function sync(){
    const v = obj[key];
    if(v){ prev.src = v; prev.style.display = ""; clr.style.display = ""; }
    else { prev.style.display = "none"; clr.style.display = "none"; }
    path.value = (v && v.indexOf("data:") !== 0) ? v : "";
  }
  file.addEventListener("change", function(){
    const f = file.files[0]; if(!f) return;
    H.downscale(f).then(function(dataUrl){ obj[key] = dataUrl; sync(); H.refreshLight(); });
  });
  path.addEventListener("input", function(){
    obj[key] = path.value.trim() || null; 
    if(obj[key]) prev.src = obj[key];
    sync(); H.refreshLight();
  });
  clr.addEventListener("click", function(){ obj[key] = null; file.value = ""; sync(); H.refreshLight(); });

  slot.appendChild(file); slot.appendChild(orL); slot.appendChild(path);
  wrap.appendChild(slot);
  const slot2 = document.createElement("div"); slot2.className = "imgslot";
  slot2.appendChild(prev); slot2.appendChild(clr);
  wrap.appendChild(slot2);
  sync();
  return wrap;
};

/* ---------- image downscaling (the speed fix) ---------- */
H.downscale = function(fileOrBlob, maxW, quality){
  maxW = maxW || 1600; quality = quality || 0.82;
  return new Promise(function(resolve, reject){
    const r = new FileReader();
    r.onerror = reject;
    r.onload = function(){
      const img = new Image();
      img.onerror = reject;
      img.onload = function(){
        let w = img.width, h = img.height;
        if(w > maxW){ h = Math.round(h * maxW / w); w = maxW; }
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.src = r.result;
    };
    r.readAsDataURL(fileOrBlob);
  });
};

/* ============================================================
   PPTX drawing helpers (shared visual language of the theme)
   ============================================================ */
H.shadow = function(){ return {type:"outer",color:"000000",blur:5,offset:2,angle:45,opacity:0.16}; };
H.hcell = function(t,o){ return {text:t,options:Object.assign({fill:{color:H.TH.MAROON},color:"FFFFFF",bold:true,fontSize:9.5,fontFace:H.TH.FONT,align:"left",valign:"middle"},o||{})}; };
H.cell  = function(t,o){ return {text:t,options:Object.assign({fill:{color:H.TH.CARD},color:H.TH.INK,fontSize:9,fontFace:H.TH.FONT,align:"left",valign:"middle"},o||{})}; };
H.stColor = function(st){ return st==="Completed" ? H.TH.GREEN : st==="In Progress" ? H.TH.AMBER : H.TH.GRAY; };
H.TB = function(){ return {pt:0.75,color:H.TH.GOLD}; };

H.logoChip = function(pres, s, dark){
  s.addShape(pres.shapes.OVAL,{x:8.52,y:0.26,w:0.34,h:0.34,fill:{color:dark?"FFFFFF":H.TH.MAROON},line:{color:H.TH.GOLD,width:1.5}});
  const lines = H.TH.BRAND.map(function(t,i){ return {text:t,options:{breakLine:i<H.TH.BRAND.length-1}}; });
  s.addText(lines,{x:8.92,y:0.22,w:1.05,h:0.45,fontFace:H.TH.FONT,fontSize:7,bold:true,color:dark?"FFFFFF":H.TH.MAROON,margin:0,lineSpacing:8});
};
H.headerBar = function(pres, s, title, sub){
  H.logoChip(pres, s, false);
  const t = (title||"").toUpperCase();
  const fsz = t.length>44 ? 17 : t.length>38 ? 19 : 23;
  s.addText(t,{x:0.45,y:0.22,w:7.9,h:0.5,fontFace:H.TH.FONT,fontSize:fsz,bold:true,color:H.TH.DMAROON,margin:0,valign:"middle"});
  if(sub) s.addText(sub,{x:0.45,y:0.7,w:9.1,h:0.3,fontFace:H.TH.FONT,fontSize:11.5,color:H.TH.INK,margin:0,valign:"middle"});
};
H.placeholderBox = function(pres, s, x,y,w,h,label){
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:w,h:h,rectRadius:0.07,fill:{color:"F2EAD2"},line:{color:H.TH.GOLD,width:1,dashType:"dash"}});
  s.addText("PHOTO\n"+(label||""),{x:x,y:y,w:w,h:h,align:"center",valign:"middle",fontFace:H.TH.FONT,fontSize:10,color:H.TH.MUTED});
};
/* image value may be a data URL or a repo path */
H.addImg = function(pres, s, val, opts){
  const o = Object.assign({}, opts);
  if(String(val).indexOf("data:") === 0) o.data = val; else o.path = val;
  s.addImage(o);
};

/* ============================================================
   PREVIEW kit — same inch coordinates, rendered as HTML
   (1 slide = 10in x 5.625in mapped to percentages; fonts in cqw)
   ============================================================ */
const PV = {};
H.pv = PV;
function pct(x, total){ return (x/total*100) + "%"; }
function fsz(pt){ return (pt*0.1389).toFixed(3) + "cqw"; }  /* pt -> container-relative */
PV.fsz = fsz;
PV.box = function(host, o){
  const d = document.createElement("div");
  d.style.position = "absolute";
  d.style.left = pct(o.x,10); d.style.top = pct(o.y,5.625);
  d.style.width = pct(o.w,10); d.style.height = pct(o.h,5.625);
  if(o.bg) d.style.background = "#"+o.bg;
  if(o.alpha != null) d.style.opacity = o.alpha;
  if(o.radius) d.style.borderRadius = "1.2cqw";
  if(o.line) d.style.border = (o.lineW||0.18)+"cqw "+(o.dash?"dashed":"solid")+" #"+o.line;
  if(o.shadow) d.style.boxShadow = "0 0.4cqw 1cqw rgba(0,0,0,.18)";
  host.appendChild(d);
  return d;
};
PV.text = function(host, o){
  const d = PV.box(host, o);
  d.style.display = "flex";
  d.style.flexDirection = "column";
  d.style.justifyContent = o.valign === "middle" ? "center" : "flex-start";
  d.style.alignItems = o.align === "center" ? "center" : o.align === "right" ? "flex-end" : "flex-start";
  d.style.textAlign = o.align || "left";
  d.style.fontSize = fsz(o.size || 12);
  d.style.lineHeight = "1.3";
  d.style.color = "#"+(o.color || H.TH.INK);
  if(o.bold) d.style.fontWeight = "700";
  if(o.italic) d.style.fontStyle = "italic";
  d.style.whiteSpace = "pre-line";
  d.style.overflow = "hidden";
  d.textContent = o.text || "";
  return d;
};
PV.rich = function(host, o, parts){
  const d = PV.text(host, Object.assign({}, o, {text:""}));
  parts.forEach(function(p){
    const sp = document.createElement(p.block ? "div" : "span");
    sp.textContent = p.text || "";
    sp.style.fontSize = fsz(p.size || o.size || 12);
    sp.style.color = "#"+(p.color || o.color || H.TH.INK);
    if(p.bold) sp.style.fontWeight = "700";
    if(p.italic) sp.style.fontStyle = "italic";
    d.appendChild(sp);
  });
  return d;
};
PV.img = function(host, o){
  const d = PV.box(host, o);
  d.style.backgroundImage = "url('"+o.src.replace(/'/g,"%27")+"')";
  d.style.backgroundSize = "cover";
  d.style.backgroundPosition = "center";
  return d;
};
PV.logo = function(host, dark){
  PV.box(host,{x:8.52,y:0.26,w:0.34,h:0.34,bg:dark?"FFFFFF":H.TH.MAROON,line:H.TH.GOLD,lineW:0.25}).style.borderRadius="50%";
  PV.text(host,{x:8.92,y:0.22,w:1.0,h:0.5,text:H.TH.BRAND.join("\n"),size:6,bold:true,color:dark?"FFFFFF":H.TH.MAROON});
};
PV.headerBar = function(host, title, sub){
  PV.logo(host,false);
  const t = (title||"").toUpperCase();
  const s = t.length>44?17:t.length>38?19:23;
  PV.text(host,{x:0.45,y:0.22,w:7.9,h:0.5,text:t,size:s,bold:true,color:H.TH.DMAROON,valign:"middle"});
  if(sub) PV.text(host,{x:0.45,y:0.7,w:9.1,h:0.3,text:sub,size:11.5,color:H.TH.INK,valign:"middle"});
};

/* ============================================================
   UI — tray, editor, preview
   ============================================================ */
function el(id){ return document.getElementById(id); }
function typeLabel(t){ const d = OWOF.templates[t]; return d ? d.label : t; }
function slideLabel(s){ return s.name || s.title || typeLabel(s.type); }

function renderTray(){
  const tray = el("tray"); if(!tray) return;
  tray.innerHTML = "";
  if(!OWOF.slides.length){ tray.innerHTML = '<p class="empty">No slides yet.</p>'; return; }
  OWOF.slides.forEach(function(s, i){
    const d = document.createElement("div");
    d.className = "slidecard" + (i===OWOF.selected ? " sel" : "");
    d.innerHTML = '<div class="num">'+(i+1)+'</div>'+
      '<div class="label"><div class="ty"></div><div class="nm"></div></div>'+
      '<div class="mini"><button title="Move up">&#9650;</button><button title="Move down">&#9660;</button>'+
      '<button title="Duplicate">&#10697;</button><button title="Delete">&#10005;</button></div>';
    d.querySelector(".ty").textContent = typeLabel(s.type);
    d.querySelector(".nm").textContent = slideLabel(s);
    d.addEventListener("click", function(){ OWOF.selected = i; H.refreshAll(); });
    const b = d.querySelectorAll(".mini button");
    b[0].onclick = function(e){ e.stopPropagation(); if(i>0){ const a=OWOF.slides; const t=a[i-1]; a[i-1]=a[i]; a[i]=t; if(OWOF.selected===i)OWOF.selected=i-1; H.refreshAll(); } };
    b[1].onclick = function(e){ e.stopPropagation(); const a=OWOF.slides; if(i<a.length-1){ const t=a[i+1]; a[i+1]=a[i]; a[i]=t; if(OWOF.selected===i)OWOF.selected=i+1; H.refreshAll(); } };
    b[2].onclick = function(e){ e.stopPropagation(); OWOF.slides.splice(i+1,0,JSON.parse(JSON.stringify(s))); H.refreshAll(); };
    b[3].onclick = function(e){ e.stopPropagation(); OWOF.slides.splice(i,1); if(OWOF.selected>=OWOF.slides.length)OWOF.selected=OWOF.slides.length-1; H.refreshAll(); };
    tray.appendChild(d);
  });
}

function renderEditor(){
  const ed = el("editor"); if(!ed) return;
  ed.innerHTML = "";
  const s = OWOF.slides[OWOF.selected];
  if(!s){ ed.innerHTML = '<p class="empty">Add a slide on the left, or load the sample deck.</p>'; return; }
  const head = document.createElement("div");
  head.innerHTML = '<h2 class="serif"></h2><p class="sub">Changes save automatically and show in the preview. Use Download PPTX when ready.</p>';
  head.querySelector("h2").textContent = "Slide "+(OWOF.selected+1)+" — "+typeLabel(s.type);
  ed.appendChild(head);
  const def = OWOF.templates[s.type];
  if(def) def.editor(s, ed, H);
  else {
    const p = document.createElement("p"); p.className = "empty";
    p.textContent = 'This deck uses a "'+s.type+'" slide, but that template chapter is not installed yet (coming in Phase 2). Its data is kept safe and it will export as a notice slide.';
    ed.appendChild(p);
  }
}

function renderPreview(){
  const host = el("pv"); if(!host) return;
  host.innerHTML = "";
  const s = OWOF.slides[OWOF.selected];
  const def = s && OWOF.templates[s.type];
  if(!s || !def){
    const p = document.createElement("div"); p.className = "pvempty";
    p.textContent = s ? "No preview — template not installed." : "Preview appears here.";
    host.appendChild(p);
    return;
  }
  host.style.background = "#"+H.TH.CREAM;
  def.preview(s, host, H);
}

/* ============================================================
   BUILD
   ============================================================ */
function buildPptx(){
  const pres = new PptxGenJS();
  pres.defineLayout({name:"W", width:10, height:5.625});
  pres.layout = "W";
  OWOF.slides.forEach(function(sl){
    const def = OWOF.templates[sl.type];
    const s = pres.addSlide();
    if(def && def.pptx){ def.pptx(pres, s, sl, H); }   /* "pptx" is today's renderer; an "a4" renderer can be added per template later without touching core */
    else {
      s.background = {color:H.TH.CREAM};
      s.addText('Slide type "'+sl.type+'" — template chapter not installed yet.',
        {x:0.5,y:2.4,w:9,h:0.8,align:"center",valign:"middle",fontFace:H.TH.FONT,fontSize:16,bold:true,color:H.TH.MAROON});
    }
  });
  return pres;
}
OWOF._buildPptx = buildPptx;   /* exposed for testing */

/* ============================================================
   INIT — wire the shell (called once all chapters have loaded)
   ============================================================ */
OWOF.init = function(){
  const msg = el("msg");
  function say(t, sticky){ msg.textContent = t; if(!sticky) setTimeout(function(){ if(msg.textContent===t) msg.textContent=""; }, 5000); }

  /* populate "add slide" menu from the registry */
  const sel = el("newType");
  OWOF.order.forEach(function(t){
    const o = document.createElement("option"); o.value = t; o.textContent = OWOF.templates[t].label;
    sel.appendChild(o);
  });

  el("btnAdd").onclick = function(){
    const t = sel.value; if(!OWOF.templates[t]) return;
    OWOF.slides.push(OWOF.templates[t].defaults());
    OWOF.selected = OWOF.slides.length - 1;
    H.refreshAll();
  };

  el("btnGen").onclick = function(){
    if(typeof PptxGenJS === "undefined"){ say("PowerPoint library not loaded — check your internet connection and refresh.", true); return; }
    if(!OWOF.slides.length){ say("Add at least one slide first."); return; }
    say("Building…", true);
    try{
      buildPptx().writeFile({fileName:"OWOF_Progress_Report.pptx"})
        .then(function(){ say("Downloaded ✓ — check your Downloads folder."); })
        .catch(function(err){ console.error(err); say("Build error: "+(err && err.message || err), true); });
    }catch(err){ console.error(err); say("Build error: "+(err && err.message || err), true); }
  };

  el("btnExport").onclick = function(){
    const blob = new Blob([JSON.stringify({v:2, slides:OWOF.slides})], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "owof-deck.json"; a.click();
    URL.revokeObjectURL(a.href);
  };
  el("btnImport").onclick = function(){ el("importFile").click(); };
  el("importFile").addEventListener("change", function(e){
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = function(){
      try{
        const data = JSON.parse(r.result);
        if(!Array.isArray(data.slides)) throw new Error("not a deck file");
        OWOF.slides = data.slides;
        OWOF.selected = OWOF.slides.length ? 0 : -1;
        H.refreshAll(); say("Deck loaded ✓");
      }catch(err){ say("That file is not a saved deck (.json from this page).", true); }
    };
    r.readAsText(f);
    e.target.value = "";
  });

  el("btnSample").onclick = function(){
    OWOF.slides = [
      {type:"hero", num:"01", name:"SSS Sitaram Jindal Block", sub:"650 Bed Hospital · June 2026", img:null},
      {type:"divider", num:"01", name:"SSS Sitaram Jindal Block", sub:"650 Bed Hospital · Project Progress Report · June 2026",
       stats:[{v:"Phase 2 — 20%",l:"Overall Progress"},{v:"~35 Staff",l:"Occupying Ground Floor, Wing 1"},{v:"July 2026",l:"Ground Floor Inauguration"}]},
      {type:"overview", title:"Project Overview", sub:"Sai Ashraya — Q Block · Residential Block · June 2026",
       stats:[{v:"125 Units",l:"111 Studio · 14 × 2-BHK"},{v:"55,000 sq.ft.",l:"Built-up Area"},{v:"Rs. xx Cr",l:"Approved Budget"},{v:"12 Months",l:"Project Duration"}],
       para:"Sai Ashraya (Q Block) is a residential block comprising 111 studio units and 14 two-BHK units, with a total built-up area of 55,000 sq. ft. and a planned execution duration of 12 months.",
       band1:"Funds position: received Rs. yy Cr · payments made: Nil",
       band2:"Current stage and work progress to be updated."},
      {type:"table", title:"Progress Update", sub:"SSS Sitaram Jindal Block · June 2026", overall:"Phase 2 — 20% Complete",
       rows:[
        {item:"Civil and MS Structure", status:"Completed", remarks:"Phase 1 complete"},
        {item:"External Elevation — Shilpi Elements", status:"In Progress", remarks:"80% complete"},
        {item:"5th and 6th Floor Waterproofing", status:"In Progress", remarks:"Ongoing"},
        {item:"Electrical Sub Station and Express Feeder", status:"Not Started", remarks:"To be planned"}],
       stage:"Ground floor occupied by ~35 staff in Wing 1.", milestone:"July 2026 — Ground Floor Inauguration"},
      {type:"photos", title:"Wing 1", sub:"SSS Sitaram Jindal Block · June 2026",
       caption:"Staff of CSR, Ayushman Bharath and Marketing using the offices — about 35 nos.", img1:null, img2:null},
      {type:"fin", title:"C: Payments of Pending Vendors", sub:"SSS Sitaram Jindal Block · June 2026",
       note:"Statutory and land expenses not included.",
       rows:[
        {sl:"C.1", part:"Civil Works", amt:"1500", works:"Civil vendor, MS and GFRC majorly"},
        {sl:"C.2", part:"Services and Interiors", amt:"1012", works:"Interiors and services"},
        {sl:"C.3", part:"Museum", amt:"35", works:"Architects and interior vendors"}]},
      {type:"thanks", line1:"One World One Family Mission", line2:"All Projects — Progress Report · June 2026"}
    ];
    OWOF.selected = 0;
    H.refreshAll();
  };

  if(typeof PptxGenJS === "undefined")
    say("PowerPoint library failed to load — check your internet connection or firewall, then refresh.", true);

  H.refreshAll();
};

})();
