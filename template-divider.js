/* template-divider.js — code chapter: project divider (big number + name band + 3 stat cards). */
OWOF.registerTemplate({
  type: "divider",
  label: "Project divider (number + stats)",

  defaults: function(){
    return { type:"divider", num:"01", name:"Project Name",
      sub:"Subtitle · Project Progress Report · Month 2026",
      stats:[{v:"xx%",l:"Overall Progress"},{v:"xx",l:"Key fact"},{v:"xx",l:"Next milestone"}] };
  },

  editor: function(s, host, H){
    const fs = H.fieldset("Divider content");
    const g = document.createElement("div"); g.className = "grid3";
    g.appendChild(H.fld("Project number", s, "num"));
    g.appendChild(H.fld("Project name", s, "name"));
    g.appendChild(H.fld("Subtitle line", s, "sub"));
    fs.appendChild(g); host.appendChild(fs);

    const fs2 = H.fieldset("Three stat cards (big value + small label)");
    s.stats.forEach(function(st){
      const r = document.createElement("div"); r.className = "rowline t2";
      const a = document.createElement("input"); a.value = st.v; a.placeholder = "Big value";
      a.oninput = function(){ st.v = a.value; H.refreshLight(); };
      const b = document.createElement("input"); b.value = st.l; b.placeholder = "Small label";
      b.oninput = function(){ st.l = b.value; H.refreshLight(); };
      r.appendChild(a); r.appendChild(b); r.appendChild(document.createElement("span"));
      fs2.appendChild(r);
    });
    host.appendChild(fs2);
  },

  preview: function(s, host, H){
    const PV = H.pv, TH = H.TH;
    PV.logo(host, false);
    PV.text(host,{x:0.45,y:0.85,w:3.0,h:1.5,text:s.num||"",size:88,bold:true,color:TH.GOLD});
    PV.box(host,{x:0.5,y:2.45,w:1.4,h:0.05,bg:TH.MAROON});
    PV.box(host,{x:2.7,y:0.95,w:6.85,h:1.7,bg:TH.MAROON,radius:true,shadow:true});
    PV.rich(host,{x:3.0,y:1.1,w:6.3,h:1.4,valign:"middle"},[
      {text:(s.name||"").toUpperCase(), size:24, bold:true, color:"FFFFFF", block:true},
      {text:s.sub||"", size:11.5, bold:true, color:TH.GOLD, block:true}
    ]);
    (s.stats||[]).slice(0,3).forEach(function(st,i){
      const x = 0.45 + i*3.1;
      PV.box(host,{x:x,y:3.25,w:2.95,h:1.5,bg:TH.CARD,line:TH.GOLD,radius:true,shadow:true});
      PV.rich(host,{x:x+0.15,y:3.35,w:2.65,h:1.3,align:"center",valign:"middle"},[
        {text:st.v||"", size:15, bold:true, color:(st.v||"").indexOf("xx")>=0?H.TH.GRAY:TH.MAROON, block:true},
        {text:st.l||"", size:9.5, color:TH.MUTED, block:true}
      ]);
    });
  },

  pptx: function(pres, s, d, H){
    const TH = H.TH;
    s.background = {color:TH.CREAM};
    H.logoChip(pres, s, false);
    s.addText(d.num||"",{x:0.45,y:0.85,w:3.0,h:1.5,fontFace:TH.FONT,fontSize:88,bold:true,color:TH.GOLD,margin:0});
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:2.45,w:1.4,h:0.05,fill:{color:TH.MAROON}});
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:2.7,y:0.95,w:6.85,h:1.7,rectRadius:0.1,fill:{color:TH.MAROON},shadow:H.shadow()});
    s.addText([
      {text:(d.name||"").toUpperCase(), options:{fontSize:24,bold:true,color:"FFFFFF",breakLine:true}},
      {text:d.sub||"", options:{fontSize:11.5,bold:true,color:TH.GOLD}}
    ],{x:3.0,y:1.1,w:6.3,h:1.4,fontFace:TH.FONT,valign:"middle",lineSpacing:24});
    (d.stats||[]).slice(0,3).forEach(function(st,i){
      const x = 0.45 + i*3.1;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:3.25,w:2.95,h:1.5,rectRadius:0.09,fill:{color:TH.CARD},line:{color:TH.GOLD,width:1},shadow:H.shadow()});
      s.addText([
        {text:st.v||"", options:{fontSize:15,bold:true,color:(st.v||"").indexOf("xx")>=0?TH.GRAY:TH.MAROON,breakLine:true}},
        {text:st.l||"", options:{fontSize:9.5,color:TH.MUTED}}
      ],{x:x+0.15,y:3.35,w:2.65,h:1.3,fontFace:TH.FONT,align:"center",valign:"middle",lineSpacing:16});
    });
  }
});
