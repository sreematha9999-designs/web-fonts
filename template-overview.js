/* template-overview.js — code chapter: project overview (4 stat cards + paragraph + highlight band). */
OWOF.registerTemplate({
  type: "overview",
  label: "Project overview",

  defaults: function(){
    return { type:"overview", title:"Project Overview", sub:"Project Name · Month 2026",
      stats:[{v:"xx sq.ft.",l:"Built-up Area"},{v:"Rs. xx Cr",l:"Approved Budget"},{v:"Rs. xx Cr",l:"Spent"},{v:"xx Months",l:"Project Duration"}],
      para:"Short description of the project.",
      band1:"CURRENT STAGE: …", band2:"Next milestone: …" };
  },

  editor: function(s, host, H){
    const fs = H.fieldset("Header");
    const g = document.createElement("div"); g.className = "grid2";
    g.appendChild(H.fld("Title", s, "title"));
    g.appendChild(H.fld("Subtitle line", s, "sub"));
    fs.appendChild(g); host.appendChild(fs);

    const fs2 = H.fieldset("Four stat cards");
    s.stats.forEach(function(st){
      const r = document.createElement("div"); r.className = "rowline t2";
      const a = document.createElement("input"); a.value = st.v;
      a.oninput = function(){ st.v = a.value; H.refreshLight(); };
      const b = document.createElement("input"); b.value = st.l;
      b.oninput = function(){ st.l = b.value; H.refreshLight(); };
      r.appendChild(a); r.appendChild(b); r.appendChild(document.createElement("span"));
      fs2.appendChild(r);
    });
    host.appendChild(fs2);

    const fs3 = H.fieldset("Description & highlight band");
    fs3.appendChild(H.fld("Paragraph", s, "para", {area:true, rows:4}));
    fs3.appendChild(H.fld("Band line 1 (gold, capitals)", s, "band1"));
    fs3.appendChild(H.fld("Band line 2 (white)", s, "band2"));
    host.appendChild(fs3);
  },

  preview: function(s, host, H){
    const PV = H.pv, TH = H.TH;
    PV.headerBar(host, s.title, s.sub);
    (s.stats||[]).slice(0,4).forEach(function(st,i){
      const x = 0.45 + i*2.33;
      PV.box(host,{x:x,y:1.15,w:2.18,h:1.0,bg:TH.CARD,line:TH.GOLD,radius:true,shadow:true});
      PV.rich(host,{x:x+0.1,y:1.23,w:1.98,h:0.84,align:"center",valign:"middle"},[
        {text:st.v||"", size:15, bold:true, color:(st.v||"").indexOf("xx")>=0?TH.GRAY:TH.MAROON, block:true},
        {text:st.l||"", size:8.5, color:TH.MUTED, block:true}
      ]);
    });
    PV.text(host,{x:0.45,y:2.45,w:9.1,h:1.0,text:s.para||"",size:12,color:TH.INK});
    PV.box(host,{x:0.45,y:3.7,w:9.1,h:1.35,bg:TH.MAROON,radius:true,shadow:true});
    PV.rich(host,{x:0.8,y:3.85,w:8.4,h:1.05,valign:"middle"},[
      {text:(s.band1||"").toUpperCase(), size:13, bold:true, color:TH.GOLD, block:true},
      {text:s.band2||"", size:11, color:"FFFFFF", block:true}
    ]);
  },

  pptx: function(pres, s, d, H){
    const TH = H.TH;
    s.background = {color:TH.CREAM};
    H.headerBar(pres, s, d.title, d.sub);
    (d.stats||[]).slice(0,4).forEach(function(st,i){
      const x = 0.45 + i*2.33;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:1.15,w:2.18,h:1.0,rectRadius:0.08,fill:{color:TH.CARD},line:{color:TH.GOLD,width:0.75},shadow:H.shadow()});
      s.addText([
        {text:st.v||"", options:{fontSize:15,bold:true,color:(st.v||"").indexOf("xx")>=0?TH.GRAY:TH.MAROON,breakLine:true}},
        {text:st.l||"", options:{fontSize:8.5,color:TH.MUTED}}
      ],{x:x+0.1,y:1.23,w:1.98,h:0.84,fontFace:TH.FONT,align:"center",valign:"middle",lineSpacing:15});
    });
    s.addText(d.para||"",{x:0.45,y:2.45,w:9.1,h:1.0,fontFace:TH.FONT,fontSize:12,color:TH.INK,margin:0});
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.45,y:3.7,w:9.1,h:1.35,rectRadius:0.09,fill:{color:TH.MAROON},shadow:H.shadow()});
    s.addText([
      {text:(d.band1||"").toUpperCase(), options:{fontSize:13,bold:true,color:TH.GOLD,breakLine:true}},
      {text:d.band2||"", options:{fontSize:11,color:"FFFFFF"}}
    ],{x:0.8,y:3.85,w:8.4,h:1.05,fontFace:TH.FONT,valign:"middle",lineSpacing:17});
  }
});
