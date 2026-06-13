/* template-content.js — code chapter: title + bullet/paragraph list (+ optional highlight band).
   The text workhorse: methodology, assumptions, T&C, narrative. */
OWOF.registerTemplate({
  type: "content",
  label: "Content (bullets / text)",

  defaults: function(){
    return { type:"content", title:"Section Title", sub:"",
      bullets:[ "First point", "Second point" ], band:"" };
  },

  editor: function(s, host, H){
    const fs = H.fieldset("Header");
    const g = document.createElement("div"); g.className = "grid2";
    g.appendChild(H.fld("Title", s, "title"));
    g.appendChild(H.fld("Subtitle (optional)", s, "sub"));
    fs.appendChild(g); host.appendChild(fs);

    const fs2 = H.fieldset("Points — plain text, or 'Bold lead :: detail under it'");
    s.bullets.forEach(function(b, bi){
      const r = document.createElement("div"); r.className = "rowline t2";
      const txt = (typeof b === "object") ? (b.text + (b.sub ? " :: " + b.sub : "")) : b;
      const a = document.createElement("input"); a.value = txt; a.placeholder = "Point text  (use :: for a bold lead + detail)";
      a.style.gridColumn = "1 / span 2";
      a.oninput = function(){
        const v = a.value;
        if(v.indexOf("::") >= 0){ const p = v.split("::"); s.bullets[bi] = {text:p[0].trim(), sub:p.slice(1).join("::").trim()}; }
        else s.bullets[bi] = v;
        H.refreshLight();
      };
      const x = document.createElement("button"); x.className = "delrow"; x.textContent = "\u2715"; x.title = "Delete point";
      x.onclick = function(){ s.bullets.splice(bi,1); H.refreshAll(); };
      r.appendChild(a); r.appendChild(x);
      fs2.appendChild(r);
    });
    const add = document.createElement("button"); add.className = "btn ghost addbtn"; add.textContent = "+ Add point";
    add.onclick = function(){ s.bullets.push(""); H.refreshAll(); };
    fs2.appendChild(add); host.appendChild(fs2);

    const fs3 = H.fieldset("Highlight band (optional)");
    fs3.appendChild(H.fld("Band line", s, "band"));
    host.appendChild(fs3);
  },

  preview: function(s, host, H){
    const PV = H.pv, TH = H.TH;
    PV.headerBar(host, s.title, s.sub);
    var y = 1.25;
    var bandH = s.band ? 0.7 : 0;
    var availH = 5.25 - y - bandH;
    var n = (s.bullets||[]).length || 1;
    var rowH = Math.min(0.62, availH / n);
    (s.bullets||[]).forEach(function(b, i){
      var yy = y + i*rowH;
      PV.text(host,{x:0.55,y:yy,w:0.3,h:rowH,text:"\u2022",size:14,bold:true,color:TH.GOLD,valign:"middle"});
      if(typeof b === "object"){
        PV.rich(host,{x:0.95,y:yy,w:8.6,h:rowH,valign:"middle"},[
          {text:(b.text||"")+"  ", size:12.5, bold:true, color:TH.MAROON},
          {text:b.sub||"", size:11, color:TH.INK}
        ]);
      } else {
        PV.text(host,{x:0.95,y:yy,w:8.6,h:rowH,text:b||"",size:12,color:TH.INK,valign:"middle"});
      }
    });
    if(s.band){
      PV.box(host,{x:0.45,y:5.0,w:9.1,h:0.55,bg:TH.MAROON,radius:true});
      PV.text(host,{x:0.7,y:5.0,w:8.6,h:0.55,text:s.band,size:11.5,bold:true,color:TH.GOLD,valign:"middle"});
    }
  },

  pptx: function(pres, s, d, H){
    const TH = H.TH;
    s.background = {color:TH.CREAM};
    H.headerBar(pres, s, d.title, d.sub);
    var y = 1.3;
    var bandH = d.band ? 0.7 : 0;
    var availH = 5.2 - y - bandH;
    var n = (d.bullets||[]).length || 1;
    var rowH = Math.min(0.6, availH / n);
    (d.bullets||[]).forEach(function(b, i){
      var yy = y + i*rowH;
      s.addText("\u2022",{x:0.55,y:yy,w:0.3,h:rowH,fontFace:TH.FONT,fontSize:14,bold:true,color:TH.GOLD,valign:"middle",margin:0});
      if(typeof b === "object"){
        s.addText([
          {text:(b.text||"")+"  ", options:{fontSize:12.5,bold:true,color:TH.MAROON}},
          {text:b.sub||"", options:{fontSize:11,color:TH.INK}}
        ],{x:0.95,y:yy,w:8.55,h:rowH,fontFace:TH.FONT,valign:"middle",margin:0});
      } else {
        s.addText(b||"",{x:0.95,y:yy,w:8.55,h:rowH,fontFace:TH.FONT,fontSize:12,color:TH.INK,valign:"middle",margin:0});
      }
    });
    if(d.band){
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.45,y:5.0,w:9.1,h:0.55,rectRadius:0.07,fill:{color:TH.MAROON}});
      s.addText(d.band,{x:0.7,y:5.0,w:8.6,h:0.55,fontFace:TH.FONT,fontSize:11.5,bold:true,color:TH.GOLD,valign:"middle",margin:0});
    }
  }
});
