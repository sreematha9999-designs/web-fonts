/* template-fin.js — code chapter: financial table with auto-calculated TOTAL.
   The same total function feeds both the preview and the PPT, so they can never disagree. */
(function(){

function finTotal(rows){
  var sum = 0, hasNonNumeric = false;
  (rows||[]).forEach(function(r){
    var n = parseFloat(String(r.amt||"").replace(/,/g,""));
    if(isFinite(n)) sum += n;
    else if(String(r.amt||"").trim() !== "") hasNonNumeric = true;
  });
  if(hasNonNumeric) return sum ? sum.toLocaleString("en-IN") + " + xx" : "xx";
  return sum.toLocaleString("en-IN");
}

OWOF.registerTemplate({
  type: "fin",
  label: "Financial table (auto total)",

  defaults: function(){
    return { type:"fin", title:"Financial Table", sub:"Project Name · Month 2026", note:"",
      rows:[{sl:"1", part:"Civil Works", amt:"", works:""}] };
  },

  editor: function(s, host, H){
    const fs = H.fieldset("Header");
    const g = document.createElement("div"); g.className = "grid2";
    g.appendChild(H.fld("Title (e.g. C: Payments of Pending Vendors)", s, "title"));
    g.appendChild(H.fld("Subtitle line", s, "sub"));
    fs.appendChild(g); host.appendChild(fs);

    const fs2 = H.fieldset("Rows — TOTAL is calculated automatically from the Amount column");
    s.rows.forEach(function(row, ri){
      const r = document.createElement("div"); r.className = "rowline t4";
      const a = document.createElement("input"); a.value = row.sl; a.placeholder = "SL";
      a.oninput = function(){ row.sl = a.value; H.refreshLight(); };
      const b = document.createElement("input"); b.value = row.part; b.placeholder = "Particulars";
      b.oninput = function(){ row.part = b.value; H.refreshLight(); };
      const c = document.createElement("input"); c.value = row.amt; c.placeholder = "Amount";
      c.oninput = function(){ row.amt = c.value; H.refreshLight(); };
      const d2 = document.createElement("input"); d2.value = row.works; d2.placeholder = "Works related to";
      d2.oninput = function(){ row.works = d2.value; H.refreshLight(); };
      const x = document.createElement("button"); x.className = "delrow"; x.textContent = "\u2715"; x.title = "Delete row";
      x.onclick = function(){ s.rows.splice(ri,1); H.refreshAll(); };
      r.appendChild(a); r.appendChild(b); r.appendChild(c); r.appendChild(d2); r.appendChild(x);
      fs2.appendChild(r);
    });
    const add = document.createElement("button"); add.className = "btn ghost addbtn"; add.textContent = "+ Add row";
    add.onclick = function(){ s.rows.push({sl:"", part:"", amt:"", works:""}); H.refreshAll(); };
    fs2.appendChild(add);
    const hint = document.createElement("p"); hint.className = "hint";
    hint.textContent = "Number amounts (1500 or 1,012) are summed; anything else (e.g. xx) makes the total show as \u201C1,500 + xx\u201D.";
    fs2.appendChild(hint);
    host.appendChild(fs2);

    const fs3 = H.fieldset("Note (optional, shown below the table)");
    fs3.appendChild(H.fld("Note", s, "note"));
    host.appendChild(fs3);
  },

  preview: function(s, host, H){
    const PV = H.pv, TH = H.TH;
    PV.headerBar(host, s.title, s.sub);
    const reg = PV.box(host,{x:0.45,y:1.3,w:9.1,h:3.6});
    reg.style.overflow = "hidden";
    const tb = document.createElement("table");
    tb.style.width = "100%"; tb.style.borderCollapse = "collapse"; tb.style.fontSize = PV.fsz(9.5);
    function td(t, head, o){
      o = o || {};
      const c = document.createElement(head ? "th" : "td");
      c.textContent = t;
      c.style.border = "0.12cqw solid #"+TH.GOLD;
      c.style.padding = "0.5cqw 0.8cqw";
      c.style.textAlign = o.align || "left";
      c.style.background = head ? "#"+TH.MAROON : "#"+TH.CARD;
      c.style.color = "#"+(head ? "FFFFFF" : (o.color || TH.INK));
      if(o.bold || head) c.style.fontWeight = "700";
      return c;
    }
    const hr = document.createElement("tr");
    hr.appendChild(td("SL.NO",true,{align:"center"})); hr.appendChild(td("Particulars",true));
    hr.appendChild(td("Amount in Lakhs (INR)",true,{align:"right"})); hr.appendChild(td("Works Related To",true));
    tb.appendChild(hr);
    (s.rows||[]).forEach(function(r){
      const n = parseFloat(String(r.amt||"").replace(/,/g,""));
      const tr = document.createElement("tr");
      tr.appendChild(td(r.sl||"",false,{align:"center"}));
      tr.appendChild(td(r.part||""));
      tr.appendChild(td(r.amt||"",false,{align:"right",color:isFinite(n)?TH.INK:TH.GRAY}));
      tr.appendChild(td(r.works||""));
      tb.appendChild(tr);
    });
    const tot = document.createElement("tr");
    tot.appendChild(td(""));
    tot.appendChild(td("TOTAL",false,{bold:true,color:TH.MAROON}));
    tot.appendChild(td(finTotal(s.rows),false,{align:"right",bold:true,color:TH.MAROON}));
    tot.appendChild(td(""));
    tb.appendChild(tot);
    reg.appendChild(tb);
    if(s.note) H.pv.rich(host,{x:0.45,y:5.15,w:9.1,h:0.3},[
      {text:"NOTE:  ", size:10, bold:true, color:TH.MAROON},
      {text:s.note, size:10, color:TH.INK}
    ]);
  },

  pptx: function(pres, s, d, H){
    const TH = H.TH;
    s.background = {color:TH.CREAM};
    H.headerBar(pres, s, d.title, d.sub);
    const data = [[H.hcell("SL.NO",{align:"center"}), H.hcell("Particulars"),
                   H.hcell("Amount in Lakhs (INR)",{align:"right"}), H.hcell("Works Related To")]];
    (d.rows||[]).forEach(function(r){
      const n = parseFloat(String(r.amt||"").replace(/,/g,""));
      data.push([H.cell(r.sl||"",{align:"center"}), H.cell(r.part||""),
                 H.cell(r.amt||"",{align:"right",color:isFinite(n)?TH.INK:TH.GRAY}), H.cell(r.works||"")]);
    });
    data.push([H.cell(""), H.cell("TOTAL",{bold:true,color:TH.MAROON}),
               H.cell(finTotal(d.rows),{align:"right",bold:true,color:TH.MAROON}), H.cell("")]);
    s.addTable(data,{x:0.45,y:1.3,w:9.1,colW:[0.7,2.3,1.8,4.3],border:H.TB(),margin:0.05,rowH:0.42,autoPage:false});
    if(d.note) s.addText([
      {text:"NOTE:  ", options:{bold:true,color:TH.MAROON}},
      {text:d.note, options:{color:TH.INK}}
    ],{x:0.45,y:5.15,w:9.1,h:0.3,fontFace:TH.FONT,fontSize:10,margin:0});
  }
});

})();
