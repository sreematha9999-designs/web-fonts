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
H.refreshLight = function(){ renderLane(); renderPreview(); };               // text edits
H.refreshAll   = function(){ renderLane(); renderEditor(); renderPreview(); }; // structural edits

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

/* ---------- SHARED SLIDE INTELLIGENCE ---------- */
/* fitText: choose a font size so text of given length fits a box of (w x h) inches.
   Approximates chars-per-line from width, lines from height. Returns pt within [min,max]. */
H.fitText = function(text, wIn, hIn, maxPt, minPt){
  maxPt = maxPt||24; minPt = minPt||9;
  var n = (text||"").length; if(n===0) return maxPt;
  for(var pt=maxPt; pt>minPt; pt--){
    var charW = pt*0.52/72;            // approx char width in inches
    var perLine = Math.max(1, Math.floor(wIn/charW));
    var lines = Math.ceil(n/perLine);
    var lineH = pt*1.25/72;            // line height in inches
    if(lines*lineH <= hIn) return pt;
  }
  return minPt;
};
/* autoGrid: n items -> {cols, rows} aiming for a pleasing near-square / wide layout */
H.autoGrid = function(n, opts){
  opts = opts||{}; var maxCols = opts.maxCols||5;
  if(n<=1) return {cols:1,rows:1};
  if(n<=maxCols) return {cols:n, rows:1};
  var cols = Math.ceil(Math.sqrt(n)); if(cols>maxCols) cols=maxCols;
  return {cols:cols, rows:Math.ceil(n/cols)};
};
/* overflowRisk: rough check used by editors to warn the user (returns true if likely to overflow) */
H.overflowRisk = function(text, wIn, hIn, minPt){
  return H.fitText(text, wIn, hIn, minPt||9, 6) <= (minPt||9);
};
/* warnBox: append a gentle overflow warning into an editor fieldset */
H.warnBox = function(host, msg){
  var w = document.createElement("p");
  w.style.cssText = "color:#A8400E;background:#FBE8D8;border:1px solid #E8B894;border-radius:6px;padding:6px 9px;font-size:11.5px;margin-top:8px;";
  w.textContent = "\u26A0 " + msg;
  host.appendChild(w);
  return w;
};

/* ---------- DIAGRAM PRIMITIVES (for illustrative chapters, used later) ---------- */
H.connector = function(pres, s, x1,y1,x2,y2, color, wpt){
  /* PptxGenJS LINE requires x,y to be the top-left corner and w,h to be positive.
     For diagonal lines: use the bounding box, then LINE draws corner-to-corner. */
  var lx=Math.min(x1,x2), ly=Math.min(y1,y2);
  var lw=Math.abs(x2-x1)||0.01, lh=Math.abs(y2-y1)||0.01;
  /* flipH/flipV tell PptxGenJS which diagonal direction */
  var flipH = x2<x1, flipV = y2<y1;
  s.addShape(pres.shapes.LINE, {x:lx,y:ly,w:lw,h:lh,
    flipH:flipH, flipV:flipV,
    line:{color:color||H.TH.GOLD, width:wpt||2}});
};
H.arrowRight = function(pres, s, x, y, w, h, color){
  s.addShape(pres.shapes.CHEVRON, {x:x,y:y,w:w,h:h, fill:{color:color||H.TH.GOLD}});
};

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
   UI — 4-zone workspace: palette | deck lane | editor | design variants
   The palette & lane thumbnails reuse each template's own preview() rendered
   tiny, so adding template chapters needs no UI changes.
   ============================================================ */
function el(id){ return document.getElementById(id); }
function typeLabel(t){ const d = OWOF.templates[t] || (OWOF.a4Templates && OWOF.a4Templates[t]); return d ? d.label : t; }
function slideLabel(s){ return s.name || s.title || s.sectionTitle || typeLabel(s.type); }

/* render a slide object into a fixed-size mini preview surface */
function miniPreview(host, slide){
  host.innerHTML = "";
  /* check both registries — landscape first, then A4 */
  var isA4 = !!(OWOF.a4Templates && OWOF.a4Templates[slide.type]);
  /* toggle portrait aspect-ratio class on the thumbnail container */
  if(isA4){ host.classList.add("a4thumb"); }
  else     { host.classList.remove("a4thumb"); }
  const def = OWOF.templates[slide.type] || (OWOF.a4Templates && OWOF.a4Templates[slide.type]);
  if(!def || !def.preview){
    const p = document.createElement("div"); p.className = "pvempty";
    p.textContent = slide.type || "?";
    host.appendChild(p); return;
  }
  host.style.background = "#"+H.TH.CREAM;
  try{ def.preview(slide, host, H); }
  catch(e){ console.warn("preview error for "+slide.type+":", e.message); host.innerHTML = '<div class="pvempty">'+slide.type+'</div>'; }
}

/* ---------- ZONE 1: visual palette of slide types ---------- */
function renderPalette(){
  const pal = el("palette"); if(!pal) return;
  pal.innerHTML = "";
  OWOF.order.forEach(function(t){
    const def = OWOF.templates[t];
    const card = document.createElement("div");
    card.className = "palcard";
    card.draggable = true;
    card.title = "Drag into the deck, or click to add at the end";
    const thumb = document.createElement("div"); thumb.className = "thumb";
    miniPreview(thumb, def.defaults());
    const cap = document.createElement("div"); cap.className = "palcap"; cap.textContent = def.label;
    card.appendChild(thumb); card.appendChild(cap);
    card.addEventListener("click", function(){ addSlide(t); });
    card.addEventListener("dragstart", function(e){ e.dataTransfer.setData("text/owof-new", t); e.dataTransfer.effectAllowed="copy"; });
    pal.appendChild(card);
  });
}

function addSlide(type, atIndex){
  if(!OWOF.templates[type]) return;
  const s = OWOF.templates[type].defaults();
  if(atIndex==null || atIndex<0 || atIndex>OWOF.slides.length){ OWOF.slides.push(s); OWOF.selected = OWOF.slides.length-1; }
  else { OWOF.slides.splice(atIndex,0,s); OWOF.selected = atIndex; }
  H.refreshAll();
}

/* ---------- ZONE 2: the deck lane (filmstrip) with drag-drop ---------- */
let dragFrom = -1;
function renderLane(){
  const lane = el("lane"); if(!lane) return;
  lane.innerHTML = "";
  if(!OWOF.slides.length){
    lane.innerHTML = '<p class="empty">Drag a slide type here, or click one in the palette.</p>';
    wireLaneDropEnd(lane);
    return;
  }
  OWOF.slides.forEach(function(s, i){
    const row = document.createElement("div");
    row.className = "lanecard" + (i===OWOF.selected ? " sel" : "");
    row.draggable = true;

    const num = document.createElement("div"); num.className = "lnum"; num.textContent = (i+1);
    const thumb = document.createElement("div"); thumb.className = "lthumb";
    miniPreview(thumb, s);
    const meta = document.createElement("div"); meta.className = "lmeta";
    const ty = document.createElement("div"); ty.className = "lty"; ty.textContent = typeLabel(s.type);
    const nm = document.createElement("div"); nm.className = "lnm"; nm.textContent = slideLabel(s);
    meta.appendChild(ty); meta.appendChild(nm);
    const tools = document.createElement("div"); tools.className = "ltools";
    tools.innerHTML = '<button title="Duplicate">&#10697;</button><button title="Delete">&#10005;</button>';

    row.appendChild(num); row.appendChild(thumb); row.appendChild(meta); row.appendChild(tools);

    row.addEventListener("click", function(){ OWOF.selected = i; H.refreshAll(); });
    const tb = tools.querySelectorAll("button");
    tb[0].onclick = function(e){ e.stopPropagation(); OWOF.slides.splice(i+1,0,JSON.parse(JSON.stringify(s))); OWOF.selected=i+1; H.refreshAll(); };
    tb[1].onclick = function(e){ e.stopPropagation(); OWOF.slides.splice(i,1); if(OWOF.selected>=OWOF.slides.length)OWOF.selected=OWOF.slides.length-1; H.refreshAll(); };

    /* reorder existing, or accept a new type from the palette */
    row.addEventListener("dragstart", function(e){ dragFrom = i; e.dataTransfer.setData("text/owof-move", String(i)); e.dataTransfer.effectAllowed="move"; row.classList.add("dragging"); });
    row.addEventListener("dragend", function(){ row.classList.remove("dragging"); dragFrom=-1; clearDropMarks(); });
    row.addEventListener("dragover", function(e){ e.preventDefault(); row.classList.add("dropabove"); });
    row.addEventListener("dragleave", function(){ row.classList.remove("dropabove"); });
    row.addEventListener("drop", function(e){
      e.preventDefault(); row.classList.remove("dropabove");
      const newType = e.dataTransfer.getData("text/owof-new");
      if(newType){ addSlide(newType, i); return; }
      const from = parseInt(e.dataTransfer.getData("text/owof-move"),10);
      if(isNaN(from) || from===i) return;
      const a = OWOF.slides; const moved = a.splice(from,1)[0]; const to = from<i ? i-1 : i; a.splice(to,0,moved);
      OWOF.selected = to; H.refreshAll();
    });

    lane.appendChild(row);
  });
  wireLaneDropEnd(lane);
}
function clearDropMarks(){ const m = document.querySelectorAll(".dropabove"); for(var i=0;i<m.length;i++) m[i].classList.remove("dropabove"); }
function wireLaneDropEnd(lane){
  lane.addEventListener("dragover", function(e){ e.preventDefault(); });
  lane.addEventListener("drop", function(e){
    if(e.target!==lane) return;          /* only when dropped on empty space at the end */
    e.preventDefault();
    const newType = e.dataTransfer.getData("text/owof-new");
    if(newType){ addSlide(newType); return; }
    const from = parseInt(e.dataTransfer.getData("text/owof-move"),10);
    if(!isNaN(from)){ const a=OWOF.slides; const moved=a.splice(from,1)[0]; a.push(moved); OWOF.selected=a.length-1; H.refreshAll(); }
  });
}

/* ---------- ZONE 3: content editor ---------- */
function renderEditor(){
  const ed = el("editor"); if(!ed) return;
  ed.innerHTML = "";
  const s = OWOF.slides[OWOF.selected];
  if(!s){ ed.innerHTML = '<p class="empty">Add a slide (palette on the left), then click it here to edit.</p>'; return; }
  const head = document.createElement("div");
  head.innerHTML = '<h2 class="serif"></h2><p class="sub">Changes save automatically and show in the preview.</p>';
  head.querySelector("h2").textContent = "Edit — "+typeLabel(s.type);
  ed.appendChild(head);
  const def = OWOF.templates[s.type] || (OWOF.a4Templates && OWOF.a4Templates[s.type]);
  if(def) def.editor(s, ed, H);
  else {
    const p = document.createElement("p"); p.className = "empty";
    p.textContent = 'This deck uses a "'+s.type+'" slide whose template is not installed. Its data is kept safe and exports as a notice slide.';
    ed.appendChild(p);
  }
}

/* ---------- ZONE 4: preview + design variants ---------- */
function renderPreview(){
  const host = el("pv"); if(!host) return;
  host.innerHTML = "";
  const s = OWOF.slides[OWOF.selected];
  /* check both registries */
  const def = s && (OWOF.templates[s.type] || (OWOF.a4Templates && OWOF.a4Templates[s.type]));
  var isA4type = !!(s && OWOF.a4Templates && OWOF.a4Templates[s.type]);
  /* switch aspect ratio via CSS class — the class overrides the default 16/9 in stylesheet */
  if(isA4type){ host.classList.add("a4pv"); }
  else         { host.classList.remove("a4pv"); }
  if(!s || !def){
    const p = document.createElement("div"); p.className = "pvempty";
    p.textContent = s ? "No preview — template not installed." : "Preview appears here.";
    host.appendChild(p);
  } else {
    host.style.background = "#"+H.TH.CREAM;
    try{ def.preview(s, host, H); }catch(e){ console.warn("preview err:",e.message); host.innerHTML='<div class="pvempty">preview error: '+e.message+'</div>'; }
  }
  renderVariants();
}

/* design-variant zone. Templates may expose def.variants=[{id,label}] and honor slide.variant.
   With one variant each (now), this shows the single current design; expands automatically later. */
function renderVariants(){
  const vz = el("variants"); if(!vz) return;
  vz.innerHTML = "";
  const s = OWOF.slides[OWOF.selected];
  const def = s && (OWOF.templates[s.type] || (OWOF.a4Templates && OWOF.a4Templates[s.type]));
  if(!s || !def){ return; }
  const list = (def.variants && def.variants.length) ? def.variants : [{id:"default", label:"Standard"}];
  list.forEach(function(v){
    const card = document.createElement("div");
    const active = (s.variant||"default")===v.id;
    card.className = "varcard" + (active ? " sel" : "");
    const thumb = document.createElement("div"); thumb.className = "vthumb";
    const probe = JSON.parse(JSON.stringify(s)); probe.variant = v.id;
    miniPreview(thumb, probe);
    const cap = document.createElement("div"); cap.className = "vcap"; cap.textContent = v.label;
    card.appendChild(thumb); card.appendChild(cap);
    card.addEventListener("click", function(){ s.variant = v.id; H.refreshAll(); });
    vz.appendChild(card);
  });
  if(list.length<=1){
    const note = document.createElement("p"); note.className = "hint";
    note.textContent = "More design options for this slide type are coming. (One design each for now.)";
    vz.appendChild(note);
  }
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
   A4 DOCUMENT ENGINE — registry + build orchestrator
   ============================================================ */
OWOF.a4Templates = {};
OWOF.a4Order = [];
OWOF.registerA4Template = function(def){
  if(!def || !def.type) return;
  OWOF.a4Templates[def.type] = def;
  if(OWOF.a4Order.indexOf(def.type) < 0) OWOF.a4Order.push(def.type);
};

/* Build an A4 PPTX document from OWOF.slides in A4 mode */
OWOF._buildA4 = function(){
  var pres = new PptxGenJS();
  pres.defineLayout({name:"A4P", width:8.268, height:11.693});
  pres.layout = "A4P";
  OWOF.slides.forEach(function(sl){
    var def = OWOF.a4Templates[sl.type];
    var s = pres.addSlide();
    if(def && def.a4){ def.a4(pres, s, sl, H); }
    else if(def && def.pptx){ def.pptx(pres, s, sl, H); }
    else {
      s.background = {color:H.TH.CREAM};
      s.addText('A4 template "'+sl.type+'" not installed.',
        {x:0.55,y:5.0,w:7.168,h:0.8,align:"center",valign:"middle",fontFace:H.TH.FONT,fontSize:13,color:H.TH.MAROON});
    }
  });
  return pres;
};
OWOF._buildPptx_A4 = OWOF._buildA4; /* alias */


/* ============================================================
   INIT — wire the shell (called once all chapters have loaded)
   ============================================================ */
OWOF.init = function(){
  const msg = el("msg");
  function say(t, sticky){ msg.textContent = t; if(!sticky) setTimeout(function(){ if(msg.textContent===t) msg.textContent=""; }, 5000); }

  renderPalette();   /* Zone 1: visual slide-type gallery */
  if(OWOF.order.length === 0){
    const pal = el("palette");
    if(pal) pal.innerHTML = '<p class="empty">No slide types loaded — a template-*.js file is missing or misnamed in the repo. Check the browser console (F12) for a 404.</p>';
  }

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

  /* A4 mode toggle */
  var a4Mode = false;
  var chkA4 = el("chkA4Mode");
  if(chkA4) chkA4.addEventListener("change", function(){
    a4Mode = chkA4.checked;
    renderPalette(); H.refreshAll();
  });

  /* Override renderPalette to support A4 mode */
  var _basePalette = renderPalette;
  renderPalette = function(){
    var pal = el("palette"); if(!pal) return;
    pal.innerHTML = "";
    var order = a4Mode ? (OWOF.a4Order||[]) : OWOF.order;
    var tmpl  = a4Mode ? (OWOF.a4Templates||{}) : OWOF.templates;
    if(!order || !order.length){
      pal.innerHTML = '<p class="empty">'+(a4Mode ? "No A4 templates installed yet." : "No templates.")+'</p>'; return;
    }
    order.forEach(function(t){
      var def = tmpl[t]; if(!def) return;
      var card = document.createElement("div"); card.className = "palcard"; card.draggable = true;
      var thumb = document.createElement("div"); thumb.className = "thumb";
      var defs = def.defaults();
      /* preview */
      thumb.style.background = "#"+H.TH.CREAM;
      try{ def.preview(defs, thumb, H); }catch(e){ thumb.innerHTML='<div class="pvempty">'+def.label+'</div>'; }
      var cap = document.createElement("div"); cap.className = "palcap"; cap.textContent = def.label;
      card.appendChild(thumb); card.appendChild(cap);
      card.addEventListener("click", function(){
        OWOF.slides.push(def.defaults()); OWOF.selected = OWOF.slides.length-1; H.refreshAll();
      });
      card.addEventListener("dragstart", function(e){
        e.dataTransfer.setData("text/owof-new", t); e.dataTransfer.effectAllowed = "copy";
      });
      pal.appendChild(card);
    });
  };

  /* A4 download */
  var btnA4 = el("btnGenA4");
  if(btnA4) btnA4.onclick = function(){
    if(typeof PptxGenJS === "undefined"){ say("Library not loaded.", true); return; }
    if(!OWOF.slides.length){ say("Add at least one slide first."); return; }
    say("Building A4 document…", true);
    try{
      OWOF._buildA4().writeFile({fileName:"OWOF_A4_Document.pptx"})
        .then(function(){ say("A4 downloaded ✓ — open in PowerPoint, set paper to A4 portrait."); })
        .catch(function(e){ say("A4 error: "+(e&&e.message||e), true); });
    }catch(e){ say("A4 error: "+(e&&e.message||e), true); }
  };

  if(typeof PptxGenJS === "undefined")
    say("PowerPoint library failed to load — check your internet connection or firewall, then refresh.", true);

  H.refreshAll();
};

})();
