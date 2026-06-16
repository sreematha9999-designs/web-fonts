/* a4-blocks.js — A4 content block registry, layout engine, and flow detector.
   Shared by all A4 chapter files. No API, no external calls — fully offline. */
(function(){
"use strict";

/* ── BLOCK TYPE REGISTRY ─────────────────────────────────────── */
var BLOCKS = {
  paragraph:   { label:"Paragraph",    minH:0.8,  maxH:4.5,  icon:"P" },
  headline:    { label:"Headline",     minH:0.5,  maxH:1.2,  icon:"H" },
  bullet:      { label:"Bullet list",  minH:0.6,  maxH:3.5,  icon:"*" },
  pullquote:   { label:"Pull quote",   minH:0.8,  maxH:1.8,  icon:"Q" },
  caption:     { label:"Caption",      minH:0.25, maxH:0.5,  icon:"~" },
  stat:        { label:"Stat",         minH:0.7,  maxH:1.4,  icon:"#" },
  statgroup:   { label:"Stat group",   minH:0.8,  maxH:1.6,  icon:"##" },
  table:       { label:"Table",        minH:1.2,  maxH:5.0,  icon:"[]" },
  chart:       { label:"Chart",        minH:2.0,  maxH:4.5,  icon:"|" },
  financial:   { label:"Financial",    minH:1.5,  maxH:5.0,  icon:"Rs" },
  progressbar: { label:"Progress bar", minH:0.35, maxH:0.55, icon:"-" },
  photo:       { label:"Photo",        minH:1.5,  maxH:5.5,  icon:"Img" },
  diagram:     { label:"Diagram",      minH:2.0,  maxH:4.0,  icon:"D" },
  callout:     { label:"Callout box",  minH:0.6,  maxH:2.0,  icon:"!" },
  divider:     { label:"Divider",      minH:0.1,  maxH:0.15, icon:"--" },
  qr:          { label:"QR / donate",  minH:1.2,  maxH:1.8,  icon:"QR" }
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
    /* DIVIDER */
    if(/^[-=]{3,}$/.test(line)){ blocks.push({type:'divider',content:'',primary:false,props:{}}); i++; continue; }
    /* HEADLINE: ALL CAPS, short */
    if(line === line.toUpperCase() && line.length < 60 && line.length > 2 && /^[A-Z0-9\s&:\/\-]+$/.test(line)){
      blocks.push({type:'headline',content:line,primary:false,props:{}}); i++; continue;
    }
    /* STAT: starts with number or Rs, short standalone */
    if(/^(Rs\.?|INR|\d)[\d\s,\.%CrLakh]+/.test(line) && line.length < 40){
      var lbl = (lines[i+1]||'').trim();
      if(lbl && lbl.length < 50 && !/^(Rs\.?|\d)/.test(lbl)){
        blocks.push({type:'stat',content:line,primary:false,props:{label:lbl}}); i+=2; continue;
      }
      blocks.push({type:'stat',content:line,primary:false,props:{label:''}}); i++; continue;
    }
    /* PULL QUOTE */
    if(/^["']/.test(line) || line.indexOf('\u201C') === 0){
      var q = line.replace(/^["\u201C]/,'').replace(/["\u201D]$/,'');
      var attr = '';
      if((lines[i+1]||'').trim().charAt(0) === '-'){ attr=(lines[i+1]||'').trim().replace(/^[-\u2014]\s*/,''); i++; }
      blocks.push({type:'pullquote',content:q,primary:false,props:{attribution:attr}}); i++; continue;
    }
    /* BULLETS */
    if(/^[*\-\u2022]\s/.test(line)){
      var items=[];
      while(i<lines.length && /^[*\-\u2022]\s/.test((lines[i]||'').trim())){
        items.push(lines[i].trim().replace(/^[*\-\u2022]\s/,'')); i++;
      }
      blocks.push({type:'bullet',content:items.join('\n'),primary:false,props:{items:items}}); continue;
    }
    /* PROGRESS BAR */
    if(/[:]\s*\d+%/.test(line) && line.length < 80){
      var parts = line.split(/\s*:\s*/);
      blocks.push({type:'progressbar',content:line,primary:false,props:{item:parts[0],pct:parseInt(parts[parts.length-1])||0}}); i++; continue;
    }
    /* TABLE */
    if(line.indexOf('|') >= 0){
      var rows=[];
      while(i<lines.length && (lines[i]||'').indexOf('|') >= 0){
        var cells=(lines[i]||'').split('|').map(function(c){return c.trim();}).filter(Boolean);
        if(cells.length>0 && !/^[-\s|]+$/.test(lines[i])) rows.push(cells);
        i++;
      }
      if(rows.length>0) blocks.push({type:'table',content:'',primary:false,props:{rows:rows}});
      continue;
    }
    /* PARAGRAPH */
    var para=[];
    while(i<lines.length){
      var l=(lines[i]||'').trim();
      if(!l){i++;break;}
      if(/^[*\-\u2022]\s/.test(l)||/^[-=]{3,}$/.test(l)||/^["'\u201C]/.test(l)||l.indexOf('|')>=0) break;
      if(l===l.toUpperCase()&&l.length<60&&/^[A-Z0-9\s&:\/\-]+$/.test(l)) break;
      para.push(l); i++;
    }
    if(para.length>0) blocks.push({type:'paragraph',content:para.join(' '),primary:false,props:{}});
  }
  return blocks;
};

/* ── LAYOUT ENGINE ───────────────────────────────────────────── */
window.A4_engine = {
  PAGE_W: 8.268, PAGE_H: 11.693, MARGIN: 0.55, CONTENT_W: 7.168,

  inferPrimary: function(blocks){
    if(blocks.some(function(b){return b.primary;})) return blocks;
    var priority=['photo','statgroup','stat','headline','diagram','chart','paragraph','bullet'];
    var result=blocks.slice();
    for(var p=0;p<priority.length;p++){
      for(var i=0;i<result.length;i++){
        if(result[i].type===priority[p]){ result[i]=Object.assign({},result[i],{primary:true}); return result; }
      }
    }
    if(result.length>0) result[0]=Object.assign({},result[0],{primary:true});
    return result;
  },

  naturalHeight: function(block, w){
    var def=A4_BLOCKS[block.type]||{minH:0.5,maxH:2};
    switch(block.type){
      case 'paragraph':
        var chars=(block.content||'').length;
        var charsPerLine=Math.max(1,Math.floor(w/0.085));
        var lines=Math.ceil(chars/charsPerLine);
        return Math.max(def.minH, Math.min(def.maxH, lines*0.18+0.1));
      case 'bullet':
        var n=((block.props&&block.props.items)||[]).length||3;
        return Math.max(def.minH, Math.min(def.maxH, n*0.38+0.2));
      case 'table':
        var rows=((block.props&&block.props.rows)||[]).length||4;
        return Math.max(def.minH, Math.min(def.maxH, rows*0.38+0.3));
      case 'progressbar': return 0.45;
      case 'divider': return 0.15;
      default: return (def.minH+def.maxH)/2;
    }
  },

  pack: function(blocks, zone){
    var self=this; var items=[]; var y=zone.y; var n=blocks.length;
    if(!n) return items;
    var heights=blocks.map(function(b){return self.naturalHeight(b,zone.w);});
    var totalNatural=heights.reduce(function(a,b){return a+b;},0);
    var density=Math.min(1.4, Math.max(0.7, zone.h/Math.max(totalNatural,0.1)));
    blocks.forEach(function(b,i){
      var def=A4_BLOCKS[b.type]||{minH:0.3,maxH:2};
      var h=Math.min(def.maxH, Math.max(def.minH, heights[i]*density));
      items.push({block:b, x:zone.x, y:y, w:zone.w, h:h, density:density});
      y+=h+0.1;
    });
    return items;
  },

  splitColumns: function(blocks){
    var left=[], right=[];
    blocks.forEach(function(b){
      if(['photo','diagram','chart','statgroup'].indexOf(b.type)>=0) right.push(b);
      else left.push(b);
    });
    if(!left.length){ left=right.splice(0,Math.ceil(right.length/2)); }
    if(!right.length){ right=left.splice(Math.ceil(left.length/2)); }
    return {left:left, right:right};
  },

  overflows: function(blocks, zone){
    var self=this;
    var total=blocks.reduce(function(s,b){return s+self.naturalHeight(b,zone.w)+0.1;},0);
    return total > zone.h * 1.3;
  }
};

})();
