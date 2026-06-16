/* a4-blocks.js — A4 content block registry, layout engine, and flow detector.
   Shared by all A4 chapter files. No API, no external calls — fully offline.
   
   A block is: { type, content, primary, props }
   The engine takes a list of blocks + zone definitions and returns layout decisions.
*/
(function(){
"use strict";

/* ── BLOCK TYPE REGISTRY ─────────────────────────────────────── */
var BLOCKS = {
  paragraph:   { label:"Paragraph",    minH:0.8,  maxH:4.5,  icon:"¶" },
  headline:    { label:"Headline",     minH:0.5,  maxH:1.2,  icon:"H" },
  bullet:      { label:"Bullet list",  minH:0.6,  maxH:3.5,  icon:"•" },
  pullquote:   { label:"Pull quote",   minH:0.8,  maxH:1.8,  icon:""" },
  caption:     { label:"Caption",      minH:0.25, maxH:0.5,  icon:"≈" },
  stat:        { label:"Stat",         minH:0.7,  maxH:1.4,  icon:"#" },
  statgroup:   { label:"Stat group",   minH:0.8,  maxH:1.6,  icon:"##" },
  table:       { label:"Table",        minH:1.2,  maxH:5.0,  icon:"⊞" },
  chart:       { label:"Chart",        minH:2.0,  maxH:4.5,  icon:"▦" },
  financial:   { label:"Financial",    minH:1.5,  maxH:5.0,  icon:"₹" },
  progressbar: { label:"Progress bar", minH:0.35, maxH:0.55, icon:"▬" },
  photo:       { label:"Photo",        minH:1.5,  maxH:5.5,  icon:"⬜" },
  diagram:     { label:"Diagram",      minH:2.0,  maxH:4.0,  icon:"⬡" },
  callout:     { label:"Callout box",  minH:0.6,  maxH:2.0,  icon:"!" },
  divider:     { label:"Divider",      minH:0.1,  maxH:0.15, icon:"─" },
  qr:          { label:"QR / donate",  minH:1.2,  maxH:1.8,  icon:"▣" },
};
window.A4_BLOCKS = BLOCKS;

/* ── FLOW DETECTOR — rule-based, fully offline ───────────────── */
window.A4_detect = function(text){
  var lines = text.split('\n');
  var blocks = [];
  var i = 0;
  
  while(i < lines.length){
    var line = lines[i].trim();
    if(!line){ i++; continue; }

    /* DIVIDER: --- or === */
    if(/^[-=]{3,}$/.test(line)){
      blocks.push({type:'divider', content:'', primary:false, props:{}}); i++; continue;
    }
    /* HEADLINE: ALL CAPS, short, no punctuation ending */
    if(line === line.toUpperCase() && line.length < 60 && line.length > 2 && /^[A-Z0-9\s&:\/\-]+$/.test(line)){
      blocks.push({type:'headline', content:line, primary:false, props:{}}); i++; continue;
    }
    /* STAT: starts with number or Rs/₹, standalone short line */
    if(/^(Rs\.?|₹|\d)[\d\s,\.%CrLakh]+/.test(line) && line.length < 40 && lines[i+1] && lines[i+1].trim().length < 40 && !/[.!?]$/.test(line)){
      var lbl = (lines[i+1]||'').trim();
      /* check if next line looks like a label (short, no number start) */
      if(lbl && lbl.length < 50 && !/^(Rs\.?|₹|\d)/.test(lbl)){
        blocks.push({type:'stat', content:line, primary:false, props:{label:lbl}}); i+=2; continue;
      }
      blocks.push({type:'stat', content:line, primary:false, props:{label:''}}); i++; continue;
    }
    /* PULL QUOTE: line wrapped in " " or starting with " */
    if(/^[\u201C"]/.test(line)){
      var q = line.replace(/^[\u201C"]/,'').replace(/[\u201D"]$/,'');
      var attr = '';
      if(lines[i+1] && /^[\-\u2014]/.test((lines[i+1]||'').trim())){ attr=(lines[i+1]||'').trim().replace(/^[\-\u2014]\s*/,''); i++; }
      blocks.push({type:'pullquote', content:q, primary:false, props:{attribution:attr}}); i++; continue;
    }
    /* BULLETS: lines starting with • - * */
    if(/^[•\-\*]\s/.test(line)){
      var items=[];
      while(i<lines.length && /^[•\-\*]\s/.test((lines[i]||'').trim())){
        items.push(lines[i].trim().replace(/^[•\-\*]\s/,'')); i++;
      }
      blocks.push({type:'bullet', content:items.join('\n'), primary:false, props:{items:items}}); continue;
    }
    /* PROGRESS BAR: "Item name : 60%" or "Item name — 60%" */
    if(/[:—]\s*\d+%/.test(line) && line.length < 80){
      var parts = line.split(/\s*[:—]\s*/);
      blocks.push({type:'progressbar', content:line, primary:false, props:{item:parts[0], pct:parseInt(parts[parts.length-1])||0}}); i++; continue;
    }
    /* TABLE ROW: has | separators */
    if(line.includes('|')){
      var rows=[];
      while(i<lines.length && (lines[i]||'').includes('|')){
        var cells=(lines[i]||'').split('|').map(function(c){return c.trim();}).filter(Boolean);
        if(cells.length>0 && !/^[-\s|]+$/.test(lines[i])) rows.push(cells);
        i++;
      }
      if(rows.length>0) blocks.push({type:'table', content:'', primary:false, props:{rows:rows}});
      continue;
    }
    /* PARAGRAPH: collect consecutive non-special lines */
    var para=[];
    while(i<lines.length){
      var l=(lines[i]||'').trim();
      if(!l){i++;break;}
      if(/^[•\-\*]\s/.test(l)||/^[-=]{3,}$/.test(l)||/^[\u201C"]/.test(l)||l.includes('|')) break;
      if(l===l.toUpperCase()&&l.length<60&&/^[A-Z0-9\s&:\/\-]+$/.test(l)) break;
      para.push(l); i++;
    }
    if(para.length>0) blocks.push({type:'paragraph', content:para.join(' '), primary:false, props:{}});
  }
  return blocks;
};

/* ── LAYOUT ENGINE ───────────────────────────────────────────── */
/* A4 usable area: 8.268" wide, ~10.4" tall (with header/footer)
   Margins: 0.55" each side → content width = 7.168"
   Zones are defined per chapter; engine packs blocks into them. */

window.A4_engine = {
  PAGE_W: 8.268,
  PAGE_H: 11.693,
  MARGIN: 0.55,
  CONTENT_W: 7.168,  /* PAGE_W - 2*MARGIN */

  /* Detect if a photo block is portrait or landscape orientation */
  photoOrientation: function(src){
    /* We can't read actual dimensions in sync; use filename hints or default */
    return 'landscape'; /* engine will update if img loads */
  },

  /* Assign primary block if user hasn't flagged one */
  inferPrimary: function(blocks){
    if(blocks.some(function(b){return b.primary;})) return blocks;
    /* Priority: photo > stat/statgroup > headline > paragraph */
    var priority=['photo','statgroup','stat','headline','diagram','chart','paragraph','bullet'];
    var result=blocks.slice();
    for(var p=0;p<priority.length;p++){
      for(var i=0;i<result.length;i++){
        if(result[i].type===priority[p]){ result[i].primary=true; return result; }
      }
    }
    if(result.length>0) result[0].primary=true;
    return result;
  },

  /* Calculate natural height of a block given available width */
  naturalHeight: function(block, w){
    var def=A4_BLOCKS[block.type]||{minH:0.5,maxH:2};
    switch(block.type){
      case 'paragraph':
        var words=(block.content||'').split(/\s+/).length;
        var charsPerLine=Math.floor(w/0.085); /* approx at 10pt */
        var chars=(block.content||'').length;
        var lines=Math.ceil(chars/charsPerLine);
        return Math.max(def.minH, Math.min(def.maxH, lines*0.18+0.1));
      case 'bullet':
        var n=((block.props&&block.props.items)||[]).length||3;
        return Math.max(def.minH, Math.min(def.maxH, n*0.38+0.2));
      case 'table':
        var rows=((block.props&&block.props.rows)||[]).length||4;
        return Math.max(def.minH, Math.min(def.maxH, rows*0.38+0.3));
      case 'progressbar':
        return 0.45;
      case 'divider':
        return 0.15;
      default:
        return (def.minH+def.maxH)/2;
    }
  },

  /* Main pack function: given blocks and a zone (x,y,w,h), return layout items */
  pack: function(blocks, zone){
    var self=this;
    var items=[];
    var y=zone.y;
    var avail=zone.h;
    var n=blocks.length;
    if(!n) return items;
    
    /* Calculate natural heights */
    var heights=blocks.map(function(b){ return self.naturalHeight(b, zone.w); });
    var totalNatural=heights.reduce(function(a,b){return a+b;},0);
    
    /* Density factor: scale heights to fill zone */
    var density=Math.min(1.4, Math.max(0.7, avail/Math.max(totalNatural,0.1)));
    
    blocks.forEach(function(b,i){
      var h=Math.min(
        A4_BLOCKS[b.type]?A4_BLOCKS[b.type].maxH:2,
        Math.max(A4_BLOCKS[b.type]?A4_BLOCKS[b.type].minH:0.3, heights[i]*density)
      );
      items.push({block:b, x:zone.x, y:y, w:zone.w, h:h, density:density});
      y+=h+0.1;
    });
    return items;
  },

  /* Split blocks into two columns based on type affinity */
  splitColumns: function(blocks){
    var left=[], right=[];
    blocks.forEach(function(b){
      if(['photo','diagram','chart','statgroup'].indexOf(b.type)>=0) right.push(b);
      else left.push(b);
    });
    /* if everything went one side, split evenly */
    if(!left.length){ left=right.splice(0,Math.ceil(right.length/2)); }
    if(!right.length){ right=left.splice(Math.ceil(left.length/2)); }
    return {left:left, right:right};
  },

  /* Overflow check */
  overflows: function(blocks, zone){
    var self=this;
    var total=blocks.reduce(function(s,b){return s+self.naturalHeight(b,zone.w)+0.1;},0);
    return total > zone.h * 1.3;
  }
};

})();
