/* template-chart.js — code chapter: native charts (bar, stacked/grouped bar, line, pie, doughnut).
   Preview draws a lightweight HTML approximation; the PPT uses real PptxGenJS charts. */
OWOF.registerTemplate({
  type: "chart",
  label: "Chart (bar / line / pie / doughnut)",

  defaults: function(){
    return { type:"chart", title:"Chart Title", sub:"", kind:"doughnut",
      labels:["Spent","Remaining"],
      series:[ {name:"Budget", values:[35,65]} ],
      note:"" };
  },

  editor: function(s, host, H){
    const fs = H.fieldset("Header");
    const g = document.createElement("div"); g.className = "grid3";
    g.appendChild(H.fld("Title", s, "title"));
    g.appendChild(H.fld("Subtitle (optional)", s, "sub"));
    const kl = document.createElement("div");
    const lab = document.createElement("label"); lab.textContent = "Chart type"; kl.appendChild(lab);
    const sel = document.createElement("select");
    [["doughnut","Doughnut"],["pie","Pie"],["bar","Bar"],["barStacked","Bar — stacked"],["barGrouped","Bar — grouped"],["line","Line"]].forEach(function(o){
      const op = document.createElement("option"); op.value=o[0]; op.textContent=o[1];
      if(s.kind===o[0]) op.selected=true; sel.appendChild(op);
    });
    sel.onchange = function(){ s.kind = sel.value; H.refreshLight(); };
    kl.appendChild(sel); g.appendChild(kl);
    fs.appendChild(g); host.appendChild(fs);

    const fs2 = H.fieldset("Category labels (comma-separated)");
    const li = document.createElement("input"); li.type="text"; li.value = (s.labels||[]).join(", ");
    li.oninput = function(){ s.labels = li.value.split(",").map(function(t){return t.trim();}).filter(Boolean); H.refreshLight(); };
    fs2.appendChild(li);
    const hint = document.createElement("p"); hint.className="hint";
    hint.textContent = "Pie/doughnut use one series. Bar/line can use several series (each becomes a colour). Values per series must match the number of labels.";
    fs2.appendChild(hint);
    host.appendChild(fs2);

    const fs3 = H.fieldset("Series — name + values (comma-separated)");
    s.series.forEach(function(se, i){
      const r = document.createElement("div"); r.className="rowline t2";
      const a = document.createElement("input"); a.value = se.name||""; a.placeholder="Series name";
      a.oninput = function(){ se.name = a.value; H.refreshLight(); };
      const b = document.createElement("input"); b.value = (se.values||[]).join(", "); b.placeholder="e.g. 35, 65";
      b.oninput = function(){ se.values = b.value.split(",").map(function(t){return parseFloat(t.trim());}).filter(function(n){return isFinite(n);}); H.refreshLight(); };
      const x = document.createElement("button"); x.className="delrow"; x.textContent="\u2715";
      x.onclick = function(){ s.series.splice(i,1); H.refreshAll(); };
      r.appendChild(a); r.appendChild(b); r.appendChild(x);
      fs3.appendChild(r);
    });
    const add = document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add series";
    add.onclick = function(){ s.series.push({name:"Series", values:[]}); H.refreshAll(); };
    fs3.appendChild(add); host.appendChild(fs3);

    const fs4 = H.fieldset("Note (optional)");
    fs4.appendChild(H.fld("Shown under the chart", s, "note"));
    host.appendChild(fs4);
  },

  preview: function(s, host, H){
    const PV = H.pv, TH = H.TH;
    PV.headerBar(host, s.title, s.sub);
    /* lightweight SVG approximation so the preview stays truthful about shape */
    const wrap = PV.box(host,{x:1.5,y:1.4,w:7.0,h:3.4});
    const palette = [TH.MAROON, TH.GOLD, TH.GREEN, TH.AMBER, "5B7DB1", "8A6FB0"];
    const labels = s.labels||[], series = s.series||[];
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS,"svg");
    svg.setAttribute("viewBox","0 0 700 340"); svg.style.width="100%"; svg.style.height="100%";
    function color(i){ return "#"+palette[i % palette.length]; }

    if(s.kind==="pie" || s.kind==="doughnut"){
      const vals = (series[0] && series[0].values) || [];
      const tot = vals.reduce(function(a,b){return a+b;},0) || 1;
      let ang = -Math.PI/2; const cx=350, cy=170, r=120;
      vals.forEach(function(v,i){
        const a2 = ang + (v/tot)*Math.PI*2;
        const x1=cx+r*Math.cos(ang), y1=cy+r*Math.sin(ang), x2=cx+r*Math.cos(a2), y2=cy+r*Math.sin(a2);
        const large = (a2-ang)>Math.PI?1:0;
        const p = document.createElementNS(svgNS,"path");
        p.setAttribute("d","M"+cx+","+cy+" L"+x1+","+y1+" A"+r+","+r+" 0 "+large+" 1 "+x2+","+y2+" Z");
        p.setAttribute("fill", color(i)); svg.appendChild(p);
        ang = a2;
      });
      if(s.kind==="doughnut"){ const h=document.createElementNS(svgNS,"circle"); h.setAttribute("cx",cx);h.setAttribute("cy",cy);h.setAttribute("r",62);h.setAttribute("fill","#"+TH.CREAM); svg.appendChild(h); }
    } else if(s.kind==="line"){
      const maxV = Math.max.apply(null,[1].concat([].concat.apply([],series.map(function(se){return se.values||[];})))) ;
      series.forEach(function(se,si){
        const vals = se.values||[]; let pts="";
        vals.forEach(function(v,i){ const x=60+i*(580/Math.max(1,labels.length-1)); const y=300-(v/maxV)*240; pts+=x+","+y+" "; });
        const pl=document.createElementNS(svgNS,"polyline"); pl.setAttribute("points",pts.trim()); pl.setAttribute("fill","none"); pl.setAttribute("stroke",color(si)); pl.setAttribute("stroke-width","4"); svg.appendChild(pl);
      });
    } else { /* bar family */
      const stacked = s.kind==="barStacked";
      const maxV = stacked
        ? Math.max.apply(null,[1].concat(labels.map(function(_,i){return series.reduce(function(a,se){return a+((se.values||[])[i]||0);},0);})))
        : Math.max.apply(null,[1].concat([].concat.apply([],series.map(function(se){return se.values||[];}))));
      const groupW = 580/Math.max(1,labels.length);
      labels.forEach(function(_,i){
        let stackY = 300;
        series.forEach(function(se,si){
          const v=(se.values||[])[i]||0; const h=(v/maxV)*240;
          const bw = stacked ? groupW*0.5 : (groupW*0.7)/series.length;
          const x = stacked ? 60+i*groupW+groupW*0.25 : 60+i*groupW+groupW*0.15+si*bw;
          const y = stacked ? (stackY-h) : (300-h);
          const rect=document.createElementNS(svgNS,"rect");
          rect.setAttribute("x",x); rect.setAttribute("y",y); rect.setAttribute("width",bw-2); rect.setAttribute("height",Math.max(0,h));
          rect.setAttribute("fill",color(si)); svg.appendChild(rect);
          if(stacked) stackY -= h;
        });
      });
    }
    wrap.appendChild(svg);
    if(s.note) PV.text(host,{x:0.45,y:5.0,w:9.1,h:0.3,text:s.note,size:10,italic:true,color:TH.MUTED});
  },

  pptx: function(pres, s, d, H){
    const TH = H.TH;
    s.background = {color:TH.CREAM};
    H.headerBar(pres, s, d.title, d.sub);
    const palette = [TH.MAROON, TH.GOLD, TH.GREEN, TH.AMBER, "5B7DB1", "8A6FB0"];
    const labels = d.labels || [];
    const opts = { x:1.2, y:1.4, w:7.6, h:3.4, chartColors:palette,
      showLegend:true, legendPos:"b", legendFontSize:9, legendColor:TH.INK,
      chartArea:{fill:{color:TH.CREAM}}, showTitle:false };
    try{
      if(d.kind==="pie" || d.kind==="doughnut"){
        const se = (d.series && d.series[0]) || {name:"", values:[]};
        const data = [{ name:se.name||"", labels:labels, values:se.values||[] }];
        opts.showPercent = true; opts.dataLabelColor="FFFFFF"; opts.dataLabelFontSize=10;
        if(d.kind==="doughnut") opts.holeSize = 55;
        s.addChart(d.kind==="doughnut"?pres.charts.DOUGHNUT:pres.charts.PIE, data, opts);
      } else if(d.kind==="line"){
        const data = (d.series||[]).map(function(se){ return {name:se.name||"", labels:labels, values:se.values||[]}; });
        s.addChart(pres.charts.LINE, data, opts);
      } else {
        const data = (d.series||[]).map(function(se){ return {name:se.name||"", labels:labels, values:se.values||[]}; });
        opts.barDir = "col";
        if(d.kind==="barStacked") opts.barGrouping = "stacked";
        else if(d.kind==="barGrouped") opts.barGrouping = "clustered";
        s.addChart(pres.charts.BAR, data, opts);
      }
    }catch(err){
      s.addText("Chart could not be rendered: "+(err && err.message || err),
        {x:1.2,y:2.4,w:7.6,h:0.8,align:"center",valign:"middle",fontFace:TH.FONT,fontSize:12,color:TH.GRAY});
    }
    if(d.note) s.addText(d.note,{x:0.45,y:5.0,w:9.1,h:0.3,fontFace:TH.FONT,fontSize:10,italic:true,color:TH.MUTED,margin:0});
  }
});
