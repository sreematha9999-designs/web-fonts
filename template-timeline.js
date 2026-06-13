/* template-timeline.js — code chapter: phases / process flow, left to right. */
OWOF.registerTemplate({
  type: "timeline",
  label: "Timeline / process",

  defaults: function(){
    return { type:"timeline", title:"Implementation Plan", sub:"",
      steps:[ {label:"Phase 1", sub:"Month 1"}, {label:"Phase 2", sub:"Months 2-3"}, {label:"Phase 3", sub:"Month 4"} ] };
  },

  editor: function(s, host, H){
    const fs = H.fieldset("Header");
    const g = document.createElement("div"); g.className = "grid2";
    g.appendChild(H.fld("Title", s, "title"));
    g.appendChild(H.fld("Subtitle (optional)", s, "sub"));
    fs.appendChild(g); host.appendChild(fs);

    const fs2 = H.fieldset("Steps (label + sub-line). Up to 6 fit comfortably.");
    s.steps.forEach(function(st, i){
      const r = document.createElement("div"); r.className = "rowline t2";
      const a = document.createElement("input"); a.value = st.label; a.placeholder = "Step label";
      a.oninput = function(){ st.label = a.value; H.refreshLight(); };
      const b = document.createElement("input"); b.value = st.sub; b.placeholder = "Sub-line (e.g. duration)";
      b.oninput = function(){ st.sub = b.value; H.refreshLight(); };
      const x = document.createElement("button"); x.className="delrow"; x.textContent="\u2715";
      x.onclick = function(){ s.steps.splice(i,1); H.refreshAll(); };
      r.appendChild(a); r.appendChild(b); r.appendChild(x);
      fs2.appendChild(r);
    });
    const add = document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add step";
    add.onclick = function(){ s.steps.push({label:"", sub:""}); H.refreshAll(); };
    fs2.appendChild(add); host.appendChild(fs2);
  },

  preview: function(s, host, H){
    const PV = H.pv, TH = H.TH;
    PV.headerBar(host, s.title, s.sub);
    var steps = s.steps || []; var n = steps.length || 1;
    var gap = 0.2, total = 9.1, w = (total - gap*(n-1)) / n;
    var cy = 2.9;
    PV.box(host,{x:0.45,y:cy-0.01,w:total,h:0.04,bg:TH.GOLD});
    steps.forEach(function(st,i){
      var x = 0.45 + i*(w+gap);
      var dot = PV.box(host,{x:x+w/2-0.12,y:cy-0.12,w:0.24,h:0.24,bg:TH.MAROON,line:TH.GOLD,lineW:0.2});
      dot.style.borderRadius="50%";
      var up = (i % 2 === 0);
      var by = up ? cy-1.45 : cy+0.35;
      PV.box(host,{x:x,y:by,w:w,h:1.1,bg:TH.CARD,line:TH.GOLD,radius:true,shadow:true});
      PV.rich(host,{x:x+0.1,y:by+0.05,w:w-0.2,h:1.0,align:"center",valign:"middle"},[
        {text:st.label||"", size:12.5, bold:true, color:TH.MAROON, block:true},
        {text:st.sub||"", size:9.5, color:TH.MUTED, block:true}
      ]);
    });
  },

  pptx: function(pres, s, d, H){
    const TH = H.TH;
    s.background = {color:TH.CREAM};
    H.headerBar(pres, s, d.title, d.sub);
    var steps = d.steps || []; var n = steps.length || 1;
    var gap = 0.2, total = 9.1, w = (total - gap*(n-1)) / n;
    var cy = 2.9;
    s.addShape(pres.shapes.RECTANGLE,{x:0.45,y:cy-0.01,w:total,h:0.04,fill:{color:TH.GOLD}});
    steps.forEach(function(st,i){
      var x = 0.45 + i*(w+gap);
      s.addShape(pres.shapes.OVAL,{x:x+w/2-0.12,y:cy-0.12,w:0.24,h:0.24,fill:{color:TH.MAROON},line:{color:TH.GOLD,width:1.5}});
      var up = (i % 2 === 0);
      var by = up ? cy-1.45 : cy+0.35;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:by,w:w,h:1.1,rectRadius:0.08,fill:{color:TH.CARD},line:{color:TH.GOLD,width:1},shadow:H.shadow()});
      s.addText([
        {text:st.label||"", options:{fontSize:12.5,bold:true,color:TH.MAROON,breakLine:true}},
        {text:st.sub||"", options:{fontSize:9.5,color:TH.MUTED}}
      ],{x:x+0.1,y:by+0.05,w:w-0.2,h:1.0,fontFace:TH.FONT,align:"center",valign:"middle",lineSpacing:14});
    });
  }
});
