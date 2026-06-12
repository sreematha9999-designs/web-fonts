/* templates/table.js — code chapter: progress table (work item / status / remarks). */
OWOF.registerTemplate({
  type: "table",
  label: "Progress table",

  defaults: function(){
    return { type:"table", title:"Progress Update", sub:"Project Name · Month 2026",
      overall:"xx% Complete",
      rows:[{item:"Work item", status:"In Progress", remarks:""}],
      stage:"", milestone:"" };
  },

  editor: function(s, host, H){
    const fs = H.fieldset("Header");
    const g = document.createElement("div"); g.className = "grid3";
    g.appendChild(H.fld("Title", s, "title"));
    g.appendChild(H.fld("Subtitle line", s, "sub"));
    g.appendChild(H.fld("Overall progress", s, "overall"));
    fs.appendChild(g); host.appendChild(fs);

    const fs2 = H.fieldset("Rows — work item / status / remarks");
    s.rows.forEach(function(row, ri){
      const r = document.createElement("div"); r.className = "rowline t3";
      const a = document.createElement("input"); a.value = row.item; a.placeholder = "Work item";
      a.oninput = function(){ row.item = a.value; H.refreshLight(); };
      const sel = document.createElement("select");
      ["Completed","In Progress","Not Started"].forEach(function(v){
        const o = document.createElement("option"); o.value = v; o.textContent = v;
        if(row.status === v) o.selected = true; sel.appendChild(o);
      });
      sel.onchange = function(){ row.status = sel.value; H.refreshLight(); };
      const c = document.createElement("input"); c.value = row.remarks; c.placeholder = "Remarks";
      c.oninput = function(){ row.remarks = c.value; H.refreshLight(); };
      const x = document.createElement("button"); x.className = "delrow"; x.textContent = "\u2715"; x.title = "Delete row";
      x.onclick = function(){ s.rows.splice(ri,1); H.refreshAll(); };
      r.appendChild(a); r.appendChild(sel); r.appendChild(c); r.appendChild(x);
      fs2.appendChild(r);
    });
    const add = document.createElement("button"); add.className = "btn ghost addbtn"; add.textContent = "+ Add row";
    add.onclick = function(){ s.rows.push({item:"", status:"In Progress", remarks:""}); H.refreshAll(); };
    fs2.appendChild(add); host.appendChild(fs2);

    const fs3 = H.fieldset("Footer lines");
    fs3.appendChild(H.fld("Current stage", s, "stage"));
    fs3.appendChild(H.fld("Next milestone", s, "milestone"));
    host.appendChild(fs3);
  },

  preview: function(s, host, H){
    const PV = H.pv, TH = H.TH;
    PV.headerBar(host, s.title, s.sub);
    if(s.overall) PV.rich(host,{x:0.45,y:1.0,w:9.1,h:0.3},[
      {text:"Overall Progress:  ", size:12, bold:true, color:TH.MAROON},
      {text:s.overall, size:12, bold:true, color:TH.GOLD}
    ]);
    /* table region as real HTML table */
    const reg = PV.box(host,{x:0.45,y:1.35,w:9.1,h:3.4});
    reg.style.overflow = "hidden";
    const tb = document.createElement("table");
    tb.style.width = "100%"; tb.style.borderCollapse = "collapse"; tb.style.fontSize = PV.fsz(9.5);
    function td(t, head, color, bold){
      const c = document.createElement(head ? "th" : "td");
      c.textContent = t;
      c.style.border = "0.12cqw solid #"+TH.GOLD;
      c.style.padding = "0.5cqw 0.8cqw";
      c.style.textAlign = "left";
      c.style.background = head ? "#"+TH.MAROON : "#"+TH.CARD;
      c.style.color = "#"+(head ? "FFFFFF" : (color || TH.INK));
      if(bold || head) c.style.fontWeight = "700";
      return c;
    }
    const hr = document.createElement("tr");
    hr.appendChild(td("Work Item",true)); hr.appendChild(td("Status",true)); hr.appendChild(td("Remarks",true));
    tb.appendChild(hr);
    (s.rows||[]).forEach(function(r){
      const tr = document.createElement("tr");
      tr.appendChild(td(r.item||""));
      tr.appendChild(td(r.status||"", false, H.stColor(r.status), true));
      tr.appendChild(td(r.remarks||""));
      tb.appendChild(tr);
    });
    reg.appendChild(tb);
    if(s.stage) PV.rich(host,{x:0.45,y:4.95,w:9.1,h:0.3},[
      {text:"Current Stage:  ", size:10.5, bold:true, color:TH.MAROON},
      {text:s.stage, size:10.5, color:TH.INK}
    ]);
    if(s.milestone) PV.rich(host,{x:0.45,y:5.25,w:9.1,h:0.3},[
      {text:"Next Milestone:  ", size:10.5, bold:true, color:TH.MAROON},
      {text:s.milestone, size:10.5, bold:true, color:TH.GOLD}
    ]);
  },

  pptx: function(pres, s, d, H){
    const TH = H.TH;
    s.background = {color:TH.CREAM};
    H.headerBar(pres, s, d.title, d.sub);
    if(d.overall) s.addText([
      {text:"Overall Progress:  ", options:{bold:true,color:TH.MAROON}},
      {text:d.overall, options:{bold:true,color:TH.GOLD}}
    ],{x:0.45,y:1.0,w:9.1,h:0.3,fontFace:TH.FONT,fontSize:12,margin:0});
    const data = [[H.hcell("Work Item"), H.hcell("Status"), H.hcell("Remarks")]];
    (d.rows||[]).forEach(function(r){
      data.push([H.cell(r.item||""), H.cell(r.status||"",{bold:true,color:H.stColor(r.status)}), H.cell(r.remarks||"")]);
    });
    s.addTable(data,{x:0.45,y:1.35,w:9.1,colW:[4.3,1.4,3.4],border:H.TB(),margin:0.05,autoPage:false});
    if(d.stage) s.addText([
      {text:"Current Stage:  ", options:{bold:true,color:TH.MAROON}},
      {text:d.stage, options:{color:TH.INK}}
    ],{x:0.45,y:4.95,w:9.1,h:0.3,fontFace:TH.FONT,fontSize:10.5,margin:0});
    if(d.milestone) s.addText([
      {text:"Next Milestone:  ", options:{bold:true,color:TH.MAROON}},
      {text:d.milestone, options:{bold:true,color:TH.GOLD}}
    ],{x:0.45,y:5.25,w:9.1,h:0.3,fontFace:TH.FONT,fontSize:10.5,margin:0});
  }
});
