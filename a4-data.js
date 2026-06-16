// a4-data.js — Phase A4-2
// Financial table (left) + Bar/Pie chart (right) A4 page
// Contract: OWOF.registerA4Template

(function(){
"use strict";

OWOF.registerA4Template({
  type: "a4-data",
  label: "Financial Data",
  docTypes: ["csr","project-update","fundraising","annual-report"],

  defaults: function(){
    return {
      type: "a4-data",
      sectionTitle: "Financial Summary",
      subtitle: "Budget allocation and expenditure overview",
      chartType: "bar",   // "bar" | "pie"
      chartTitle: "Expenditure Breakdown",
      note: "",
      rows: [
        { label: "Civil Works",        budget: "12.50", spent: "4.20",  status: "In Progress" },
        { label: "MEP Services",       budget: "5.80",  spent: "1.10",  status: "In Progress" },
        { label: "Structural Works",   budget: "8.40",  spent: "8.40",  status: "Completed"   },
        { label: "Interior Fit-Out",   budget: "3.20",  spent: "0.00",  status: "Not Started" },
        { label: "Equipment & Fixtures",budget:"6.10",  spent: "0.00",  status: "Not Started" }
      ],
      currency: "₹",
      unit: "Cr"
    };
  },

  // ─── EDITOR ───────────────────────────────────────────────────────────────
  editor: function(s, host, H){
    var TH = H.TH;
    host.style.fontFamily = "Arial,sans-serif";
    host.style.fontSize   = "13px";
    host.style.color      = "#" + TH.INK;

    function lbl(text){
      var l = document.createElement("div");
      l.style.cssText = "font-size:11px;font-weight:700;color:#"+TH.MUTED+";text-transform:uppercase;letter-spacing:.05em;margin:14px 0 4px";
      l.textContent = text; return l;
    }
    function inp(val, onchange, wide){
      var i = document.createElement("input");
      i.type  = "text"; i.value = val||"";
      i.style.cssText = "width:"+(wide?"100%":"96%")+";padding:6px 8px;border:1px solid #d0c9b0;border-radius:4px;font-size:12px;box-sizing:border-box";
      i.addEventListener("input", function(){ onchange(i.value); H.refreshLight(); });
      return i;
    }
    function sel(val, opts, onchange){
      var s2 = document.createElement("select");
      s2.style.cssText = "width:100%;padding:6px 8px;border:1px solid #d0c9b0;border-radius:4px;font-size:12px;box-sizing:border-box";
      opts.forEach(function(o){
        var op = document.createElement("option");
        op.value = o.v; op.textContent = o.t;
        if(o.v===val) op.selected = true;
        s2.appendChild(op);
      });
      s2.addEventListener("change", function(){ onchange(s2.value); H.refreshLight(); });
      return s2;
    }

    // Section title & subtitle
    host.appendChild(lbl("Section Title"));
    host.appendChild(inp(s.sectionTitle, function(v){ s.sectionTitle = v; }, true));
    host.appendChild(lbl("Subtitle"));
    host.appendChild(inp(s.subtitle, function(v){ s.subtitle = v; }, true));

    // Currency / unit
    var row1 = document.createElement("div");
    row1.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:8px";
    host.appendChild(lbl("Currency Symbol & Unit"));
    host.appendChild(row1);
    row1.appendChild(inp(s.currency, function(v){ s.currency = v; }));
    row1.appendChild(inp(s.unit,     function(v){ s.unit     = v; }));

    // Chart type + title
    host.appendChild(lbl("Chart Type"));
    host.appendChild(sel(s.chartType,[{v:"bar",t:"Bar Chart"},{v:"pie",t:"Pie Chart"}],function(v){ s.chartType=v; H.refreshLight(); }));
    host.appendChild(lbl("Chart Title"));
    host.appendChild(inp(s.chartTitle, function(v){ s.chartTitle = v; }, true));

    // Footer note
    host.appendChild(lbl("Footer Note (optional)"));
    host.appendChild(inp(s.note, function(v){ s.note = v; }, true));

    // ── Table rows ──
    host.appendChild(lbl("Line Items  (Budget & Spent in " + (s.unit||"Cr") + ")"));

    function buildRowsUI(){
      var wrap = document.getElementById("a4data-rows-wrap");
      if(wrap) wrap.remove();
      var w = document.createElement("div");
      w.id = "a4data-rows-wrap";
      w.style.cssText = "display:flex;flex-direction:column;gap:6px;margin-top:4px";
      host.appendChild(w);

      s.rows.forEach(function(r, i){
        var rw = document.createElement("div");
        rw.style.cssText = "background:#fffdf4;border:1px solid #d0c9b0;border-radius:5px;padding:8px 10px";

        // label row
        var rg = document.createElement("div");
        rg.style.cssText = "display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:6px;align-items:center";

        var li = document.createElement("input"); li.type="text"; li.value=r.label||"";
        li.placeholder="Item name";
        li.style.cssText="padding:5px 7px;border:1px solid #d0c9b0;border-radius:3px;font-size:12px";
        li.addEventListener("input",function(){ r.label=li.value; H.refreshLight(); });

        var bi = document.createElement("input"); bi.type="text"; bi.value=r.budget||"0";
        bi.placeholder="Budget";
        bi.style.cssText="padding:5px 7px;border:1px solid #d0c9b0;border-radius:3px;font-size:12px";
        bi.addEventListener("input",function(){ r.budget=bi.value; H.refreshLight(); });

        var si = document.createElement("input"); si.type="text"; si.value=r.spent||"0";
        si.placeholder="Spent";
        si.style.cssText="padding:5px 7px;border:1px solid #d0c9b0;border-radius:3px;font-size:12px";
        si.addEventListener("input",function(){ r.spent=si.value; H.refreshLight(); });

        var del = document.createElement("button");
        del.textContent = "✕";
        del.style.cssText="background:#8B1414;color:#fff;border:none;border-radius:3px;padding:5px 8px;cursor:pointer;font-size:11px";
        del.onclick = function(){ s.rows.splice(i,1); buildRowsUI(); H.refreshLight(); };

        rg.appendChild(li); rg.appendChild(bi); rg.appendChild(si); rg.appendChild(del);
        rw.appendChild(rg);

        // status select
        var sg = document.createElement("div");
        sg.style.cssText="margin-top:5px";
        var ss = sel(r.status||"Not Started",[
          {v:"Completed",t:"✅ Completed"},
          {v:"In Progress",t:"🔄 In Progress"},
          {v:"Not Started",t:"⬜ Not Started"}
        ], function(v){ r.status=v; H.refreshLight(); });
        sg.appendChild(ss); rw.appendChild(sg);
        w.appendChild(rw);
      });

      // column headers hint
      var hint = document.createElement("div");
      hint.style.cssText="font-size:10px;color:#"+TH.MUTED+";margin-bottom:2px;display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:6px;padding:0 2px";
      hint.innerHTML="<span>Label</span><span>Budget</span><span>Spent</span><span></span>";
      w.insertBefore(hint, w.firstChild);

      // add row button
      var addBtn = document.createElement("button");
      addBtn.textContent = "+ Add Row";
      addBtn.style.cssText="margin-top:6px;padding:7px 14px;background:#C9A227;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;font-weight:700";
      addBtn.onclick = function(){
        s.rows.push({label:"New Item", budget:"0.00", spent:"0.00", status:"Not Started"});
        buildRowsUI(); H.refreshLight();
      };
      w.appendChild(addBtn);
    }
    buildRowsUI();
  },

  // ─── PREVIEW ──────────────────────────────────────────────────────────────
  preview: function(s, host, H){
    var TH = H.TH;
    host.style.position = "relative";
    host.style.overflow = "hidden";
    host.style.background = "#" + TH.CREAM;
    host.innerHTML = "";

    // helper: % positioning
    var PW = 8.268, PH = 11.693;
    function box(x,y,w,h,bg,extra){
      var d = document.createElement("div");
      d.style.position = "absolute";
      d.style.left   = (x/PW*100)+"%";
      d.style.top    = (y/PH*100)+"%";
      d.style.width  = (w/PW*100)+"%";
      d.style.height = (h/PH*100)+"%";
      if(bg) d.style.background="#"+bg;
      if(extra) Object.assign(d.style,extra);
      host.appendChild(d); return d;
    }
    function txt(x,y,w,h,text,opts){
      var o = opts||{};
      var d = box(x,y,w,h,null,{
        display:"flex", overflow:"hidden", padding:"0 1%",
        alignItems:  o.va==="middle"?"center": o.va==="bottom"?"flex-end":"flex-start",
        justifyContent: o.align==="center"?"center": o.align==="right"?"flex-end":"flex-start",
        fontSize: (o.size||8)*(w/PW*100/100)+"cqw",
        fontWeight: o.bold?"700":"400",
        fontStyle:  o.italic?"italic":"normal",
        color: "#"+(o.color||TH.INK),
        fontFamily: o.serif?"Cambria,Georgia,serif":"Arial,sans-serif",
        lineHeight:"1.35", whiteSpace:"pre-line", wordBreak:"break-word"
      });
      d.textContent = text||""; return d;
    }

    // ── Top maroon band ──
    box(0,0,PW,0.52,TH.MAROON);
    box(0,0.49,PW,0.03,TH.GOLD);
    // Logo chip placeholder (white circle top-right)
    var chip = box(7.1,0.06,0.82,0.38,null,{borderRadius:"50%",border:"1.5px solid #C9A227",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",fontSize:"0.45cqw",fontWeight:"700",color:"#8B1414",fontFamily:"Arial,sans-serif",lineHeight:"1.1",padding:"2%",boxSizing:"border-box"});
    chip.textContent="ONE WORLD\nONE FAMILY\nMISSION";

    txt(0.55,0.09,5.8,0.35, s.sectionTitle||"Financial Summary",
        {size:14,bold:true,color:"FFFFFF",serif:true,va:"middle"});

    // subtitle band below
    txt(0.55,0.58,7.2,0.28, s.subtitle||"",
        {size:7.5,color:TH.MUTED,va:"middle"});

    // ── Body: 2-column layout ──
    var bodyY = 0.92, bodyH = 10.22;
    var leftW  = 4.40, leftX = 0.55;
    var rightW = 2.80, rightX= 5.08;

    // === LEFT: Financial table ===
    txt(leftX, bodyY, leftW, 0.22, "BUDGET TRACKER",
        {size:7,bold:true,color:TH.MUTED});

    // Table header
    var thY = bodyY+0.26;
    box(leftX, thY, leftW, 0.28, TH.MAROON, {borderRadius:"3px 3px 0 0"});
    var cols = [{t:"Item",x:leftX+0.06,w:1.8},{t:"Budget",x:leftX+1.92,w:0.82},{t:"Spent",x:leftX+2.78,w:0.78},{t:"Status",x:leftX+3.56,w:0.78}];
    cols.forEach(function(c){
      txt(c.x, thY+0.03, c.w, 0.22, c.t, {size:6.5,bold:true,color:"FFFFFF",va:"middle"});
    });

    // Table rows
    var rows = s.rows||[];
    var totalBudget = 0, totalSpent = 0;
    rows.forEach(function(r){ totalBudget += parseFloat(r.budget)||0; totalSpent += parseFloat(r.spent)||0; });
    var rowH = 0.30;
    var maxRows = Math.min(rows.length, 10);

    rows.slice(0,maxRows).forEach(function(r,i){
      var ry = thY + 0.28 + i*rowH;
      var rowBg = i%2===0 ? "FFFDF4" : "FAFAF7";
      box(leftX, ry, leftW, rowH, rowBg, {borderLeft:"0.75px solid #C9A227",borderRight:"0.75px solid #C9A227",borderBottom:"0.75px solid #C9A227"});

      // progress bar inside row
      var pct = Math.min(1, (parseFloat(r.spent)||0) / Math.max(0.01, parseFloat(r.budget)||1));
      var barY = ry + rowH*0.68;
      box(leftX+0.06, barY, 1.6, 0.055, "E8E0D0");
      if(pct>0) box(leftX+0.06, barY, 1.6*pct, 0.055, TH.MAROON);

      txt(leftX+0.06, ry+0.04, 1.72, 0.20, r.label||"",  {size:6.2,color:TH.INK,va:"middle"});
      txt(leftX+1.92,  ry+0.04, 0.78, 0.20, (s.currency||"₹")+(r.budget||"0")+" "+(s.unit||"Cr"),{size:6,color:TH.INK,va:"middle"});
      txt(leftX+2.78,  ry+0.04, 0.74, 0.20, (s.currency||"₹")+(r.spent||"0")+" "+(s.unit||"Cr"), {size:6,color:TH.INK,va:"middle"});
      var sc = r.status==="Completed"?TH.GREEN: r.status==="In Progress"?TH.AMBER:TH.GRAY;
      txt(leftX+3.56,  ry+0.04, 0.76, 0.20, r.status||"",{size:5.5,color:sc,bold:true,va:"middle"});
    });

    // Total row
    var totalY = thY + 0.28 + maxRows*rowH;
    box(leftX, totalY, leftW, 0.30, TH.DMAROON, {borderRadius:"0 0 3px 3px"});
    txt(leftX+0.06, totalY+0.05, 1.6, 0.20, "TOTAL",{size:6.5,bold:true,color:"FFFFFF",va:"middle"});
    txt(leftX+1.92,  totalY+0.05, 0.82,0.20, (s.currency||"₹")+totalBudget.toFixed(2)+" "+(s.unit||"Cr"),{size:6.5,bold:true,color:"FFFFFF",va:"middle"});
    txt(leftX+2.78,  totalY+0.05, 0.78,0.20, (s.currency||"₹")+totalSpent.toFixed(2)+" "+(s.unit||"Cr"), {size:6.5,bold:true,color:"FFFFFF",va:"middle"});

    // Footer note
    if(s.note){
      var noteY = totalY + 0.36;
      box(leftX, noteY, leftW, 0.28, "FBF5E2", {border:"0.75px solid #C9A227",borderRadius:"3px",padding:"2px 4px",boxSizing:"border-box"});
      txt(leftX+0.06, noteY+0.04, leftW-0.12, 0.20, "* "+s.note, {size:5.5,color:TH.MUTED,italic:true,va:"middle"});
    }

    // === RIGHT: Chart ===
    txt(rightX, bodyY, rightW, 0.22, "CHART VIEW",{size:7,bold:true,color:TH.MUTED});
    txt(rightX, bodyY+0.24, rightW, 0.20, s.chartTitle||"Expenditure Breakdown",{size:7.5,bold:true,color:TH.DMAROON,serif:true});

    var chartY = bodyY + 0.50;
    var chartH = 3.60;

    if(s.chartType === "pie"){
      // Pie chart via SVG canvas
      var pieDiv = box(rightX, chartY, rightW, chartH, null, {overflow:"visible"});
      var svgNS = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(svgNS,"svg");
      svg.style.width="100%"; svg.style.height="100%";
      pieDiv.appendChild(svg);

      var COLORS = ["8B1414","C9A227","A0522D","6B8E23","4682B4","8B4513","CD853F"];
      var totalV = rows.reduce(function(a,r){ return a+(parseFloat(r.spent)||0); },0)||1;
      var startAngle = -Math.PI/2;
      var cx=50,cy=46,r=38;

      rows.forEach(function(row,i){
        var val = parseFloat(row.spent)||0;
        if(val<=0) return;
        var angle = (val/totalV)*Math.PI*2;
        var endAngle = startAngle+angle;
        var x1=cx+r*Math.cos(startAngle), y1=cy+r*Math.sin(startAngle);
        var x2=cx+r*Math.cos(endAngle),   y2=cy+r*Math.sin(endAngle);
        var large = angle>Math.PI?1:0;
        var path = document.createElementNS(svgNS,"path");
        path.setAttribute("d","M"+cx+","+cy+" L"+x1+","+y1+" A"+r+","+r+" 0 "+large+",1 "+x2+","+y2+" Z");
        path.setAttribute("fill","#"+(COLORS[i%COLORS.length]));
        path.setAttribute("stroke","#FBF5E2"); path.setAttribute("stroke-width","0.8");
        svg.appendChild(path);
        startAngle = endAngle;
      });

      // Legend
      var legY = chartY + chartH + 0.1;
      rows.forEach(function(row,i){
        if((parseFloat(row.spent)||0)<=0) return;
        var ly = legY + i*0.22;
        box(rightX, ly, 0.14, 0.12, COLORS[i%COLORS.length], {borderRadius:"2px"});
        txt(rightX+0.18, ly, rightW-0.2, 0.14, row.label+": "+
            (s.currency||"₹")+(row.spent||"0")+" "+(s.unit||"Cr"),{size:5.5,color:TH.INK,va:"middle"});
      });

    } else {
      // Bar chart
      var barChartDiv = box(rightX, chartY, rightW, chartH, null, {overflow:"visible"});
      var svgNS2 = "http://www.w3.org/2000/svg";
      var svg2 = document.createElementNS(svgNS2,"svg");
      svg2.setAttribute("viewBox","0 0 100 100");
      svg2.setAttribute("preserveAspectRatio","xMidYMid meet");
      svg2.style.width="100%"; svg2.style.height="100%";
      barChartDiv.appendChild(svg2);

      var maxVal = 0;
      rows.forEach(function(r){ maxVal = Math.max(maxVal, parseFloat(r.budget)||0); });
      maxVal = maxVal||1;

      var n = Math.min(rows.length,8);
      var barAreaW = 90, barAreaH = 70;
      var barW = (barAreaW / n) * 0.36;
      var gap  = (barAreaW / n);
      var originY = 82;

      // axis line
      var axLine = document.createElementNS(svgNS2,"line");
      axLine.setAttribute("x1","8"); axLine.setAttribute("y1",String(originY));
      axLine.setAttribute("x2","98"); axLine.setAttribute("y2",String(originY));
      axLine.setAttribute("stroke","#C9A227"); axLine.setAttribute("stroke-width","0.5");
      svg2.appendChild(axLine);

      rows.slice(0,n).forEach(function(r,i){
        var bv = parseFloat(r.budget)||0;
        var sv = parseFloat(r.spent)||0;
        var bH  = (bv/maxVal)*barAreaH;
        var sH  = (sv/maxVal)*barAreaH;
        var cx2 = 8 + gap*i + gap/2;

        // budget bar (lighter)
        var bg2 = document.createElementNS(svgNS2,"rect");
        bg2.setAttribute("x",  String(cx2 - barW));
        bg2.setAttribute("y",  String(originY-bH));
        bg2.setAttribute("width", String(barW));
        bg2.setAttribute("height",String(bH));
        bg2.setAttribute("fill","#C9A227"); bg2.setAttribute("opacity","0.4");
        svg2.appendChild(bg2);

        // spent bar
        var sb = document.createElementNS(svgNS2,"rect");
        sb.setAttribute("x",  String(cx2));
        sb.setAttribute("y",  String(originY-sH));
        sb.setAttribute("width", String(barW));
        sb.setAttribute("height",String(Math.max(0,sH)));
        sb.setAttribute("fill","#8B1414");
        svg2.appendChild(sb);

        // label
        var lt = document.createElementNS(svgNS2,"text");
        lt.setAttribute("x",  String(cx2));
        lt.setAttribute("y",  String(originY+5));
        lt.setAttribute("text-anchor","middle");
        lt.setAttribute("font-size","4");
        lt.setAttribute("fill","#6E6E6E");
        lt.textContent = (r.label||"").substring(0,6)+"…";
        svg2.appendChild(lt);
      });

      // legend
      var legDiv = box(rightX, chartY+chartH+0.05, rightW, 0.20, null, {display:"flex",gap:"8%",alignItems:"center"});
      [{c:"C9A227",t:"Budget"},{c:"8B1414",t:"Spent"}].forEach(function(lc){
        var d = document.createElement("div");
        d.style.cssText="display:flex;align-items:center;gap:4px;font-size:0.6cqw;color:#"+TH.INK;
        var sq = document.createElement("div");
        sq.style.cssText="width:10px;height:10px;background:#"+lc.c+";border-radius:2px;flex-shrink:0";
        d.appendChild(sq);
        d.appendChild(document.createTextNode(lc.t));
        legDiv.appendChild(d);
      });
    }

    // ── Gold vertical divider between columns ──
    box(leftX+leftW+0.06, bodyY, 0.02, 10.22, TH.GOLD, {opacity:"0.5"});

    // ── Footer band ──
    box(0, 11.38, PW, 0.31, TH.DMAROON);
    txt(0.55, 11.40, 4, 0.22, "One World One Family Mission", {size:6,color:"FFFFFF",bold:true,va:"middle"});
    txt(4.5,  11.40, 3.5, 0.22, "CONFIDENTIAL · For Internal Use Only", {size:5.5,color:"C9A227",italic:true,va:"middle",align:"right"});
  },

  // ─── A4 PPTX OUTPUT ──────────────────────────────────────────────────────
  a4: function(pres, slide, s, H){
    var TH = H.TH;
    var PW = 8.268, PH = 11.693;
    var cur = s.currency||"₹";
    var unit = s.unit||"Cr";

    // ── Top band ──
    slide.addShape(pres.ShapeType.rect, {x:0,y:0,w:PW,h:0.52,fill:{color:TH.MAROON},line:{color:TH.MAROON,pt:0}});
    slide.addShape(pres.ShapeType.rect, {x:0,y:0.49,w:PW,h:0.03,fill:{color:TH.GOLD},line:{color:TH.GOLD,pt:0}});

    // Logo chip
    H.logoChip(pres, slide, false);

    // Section title in band
    slide.addText(s.sectionTitle||"Financial Summary", {
      x:0.55,y:0.07,w:6.5,h:0.38,
      fontSize:18, bold:true, color:"FFFFFF",
      fontFace:"Cambria", valign:"middle"
    });

    // Subtitle
    slide.addText(s.subtitle||"", {
      x:0.55,y:0.58,w:7.2,h:0.28,
      fontSize:9, color:TH.MUTED, fontFace:"Arial", valign:"middle"
    });

    // ── Layout constants ──
    var bodyY  = 0.92;
    var leftX  = 0.55, leftW = 4.40;
    var rightX = 5.08, rightW= 2.72;

    // ── LEFT: Budget table ──
    slide.addText("BUDGET TRACKER", {
      x:leftX,y:bodyY,w:leftW,h:0.22,
      fontSize:7, bold:true, color:TH.MUTED, fontFace:"Arial", valign:"bottom"
    });

    var rows = s.rows||[];
    var totalBudget=0, totalSpent=0;
    rows.forEach(function(r){ totalBudget+=parseFloat(r.budget)||0; totalSpent+=parseFloat(r.spent)||0; });

    // Build table data
    var tableRows = [];
    // header
    tableRows.push([
      H.hcell("Line Item",    {bold:true, fontSize:7}),
      H.hcell("Budget",       {bold:true, fontSize:7}),
      H.hcell("Spent",        {bold:true, fontSize:7}),
      H.hcell("Status",       {bold:true, fontSize:7})
    ]);

    rows.forEach(function(r){
      var sc = H.stColor(r.status||"");
      tableRows.push([
        H.cell(r.label||"",                  {fontSize:7}),
        H.cell(cur+(r.budget||"0")+" "+unit, {fontSize:7, align:"right"}),
        H.cell(cur+(r.spent||"0")+" "+unit,  {fontSize:7, align:"right"}),
        H.cell(r.status||"",                 {fontSize:6.5, bold:true, color:sc, align:"center"})
      ]);
    });

    // total row
    tableRows.push([
      {text:"TOTAL", options:{bold:true,color:"FFFFFF",fill:{color:TH.DMAROON},fontSize:7,valign:"middle"}},
      {text:cur+totalBudget.toFixed(2)+" "+unit, options:{bold:true,color:"FFFFFF",fill:{color:TH.DMAROON},fontSize:7,align:"right",valign:"middle"}},
      {text:cur+totalSpent.toFixed(2)+" "+unit,  options:{bold:true,color:"FFFFFF",fill:{color:TH.DMAROON},fontSize:7,align:"right",valign:"middle"}},
      {text:"", options:{fill:{color:TH.DMAROON}}}
    ]);

    var tableH = 0.30 + rows.length*0.30 + 0.30;
    slide.addTable(tableRows,{
      x:leftX, y:bodyY+0.26, w:leftW, h:tableH,
      border: H.TB(),
      colW:[1.80,0.82,0.78,0.78]
    });

    // Footer note
    if(s.note){
      var noteY = bodyY+0.26+tableH+0.08;
      slide.addShape(pres.ShapeType.rect,{x:leftX,y:noteY,w:leftW,h:0.28,fill:{color:"FBF5E2"},line:{color:TH.GOLD,pt:0.75}});
      slide.addText("* "+s.note,{x:leftX+0.06,y:noteY+0.04,w:leftW-0.12,h:0.20,fontSize:6,color:TH.MUTED,italic:true,fontFace:"Arial",valign:"middle"});
    }

    // ── Gold vertical rule ──
    slide.addShape(pres.ShapeType.line,{
      x:leftX+leftW+0.07, y:bodyY, w:0, h:9.8,
      line:{color:TH.GOLD, pt:0.75}
    });

    // ── RIGHT: Chart ──
    slide.addText(s.chartTitle||"Expenditure Breakdown",{
      x:rightX,y:bodyY+0.26,w:rightW,h:0.26,
      fontSize:9,bold:true,color:TH.DMAROON,fontFace:"Cambria",valign:"middle"
    });

    var chartY = bodyY+0.58;
    var chartData, chartOpts;

    if(s.chartType==="pie"){
      chartData = [{
        name:"Spent",
        labels: rows.map(function(r){ return r.label||""; }),
        values: rows.map(function(r){ return parseFloat(r.spent)||0; })
      }];
      chartOpts = {
        x:rightX, y:chartY, w:rightW, h:3.20,
        chartColors:["8B1414","C9A227","A0522D","7A5C58","4682B4","8B4513","556B2F"],
        showLegend:true, legendPos:"b", legendFontSize:6,
        showValue:true, dataLabelFontSize:6.5, dataLabelColor:"FFFFFF",
        showTitle:false
      };
      slide.addChart(pres.ChartType.pie, chartData, chartOpts);
    } else {
      chartData = [
        { name:"Budget", labels:rows.map(function(r){return r.label||"";}), values:rows.map(function(r){return parseFloat(r.budget)||0;}) },
        { name:"Spent",  labels:rows.map(function(r){return r.label||"";}), values:rows.map(function(r){return parseFloat(r.spent)||0;}) }
      ];
      chartOpts = {
        x:rightX, y:chartY, w:rightW, h:3.80,
        chartColors:["C9A227","8B1414"],
        barDir:"col", barGrouping:"clustered",
        showLegend:true, legendPos:"b", legendFontSize:6,
        showValue:false,
        valAxisLabelFontSize:6, catAxisLabelFontSize:6,
        showTitle:false,
        valGridLine:{style:"dash", color:"E8E0D0"},
        plotAreaBorderColor:"FFFFFF"
      };
      slide.addChart(pres.ChartType.bar, chartData, chartOpts);
    }

    // ── Footer band ──
    slide.addShape(pres.ShapeType.rect,{x:0,y:11.38,w:PW,h:0.31,fill:{color:TH.DMAROON},line:{color:TH.DMAROON,pt:0}});
    slide.addText("One World One Family Mission",{
      x:0.55,y:11.40,w:4,h:0.22,
      fontSize:7,bold:true,color:"FFFFFF",fontFace:"Arial",valign:"middle"
    });
    slide.addText("CONFIDENTIAL · For Internal Use Only",{
      x:4.5,y:11.40,w:3.5,h:0.22,
      fontSize:6.5,italic:true,color:"C9A227",fontFace:"Arial",valign:"middle",align:"right"
    });
  }
});

})();
