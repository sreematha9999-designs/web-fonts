/* template-compare.js — code chapter: side-by-side comparison columns (2 or 3). */
OWOF.registerTemplate({
  type: "compare",
  label: "Comparison (side by side)",

  defaults: function(){
    return { type:"compare", title:"Comparison", sub:"",
      cols:[ {head:"Option A", items:["point","point"], accent:"maroon"},
             {head:"Option B", items:["point","point"], accent:"gold"} ] };
  },

  editor: function(s, host, H){
    const fs = H.fieldset("Header");
    const g = document.createElement("div"); g.className = "grid2";
    g.appendChild(H.fld("Title", s, "title"));
    g.appendChild(H.fld("Subtitle (optional)", s, "sub"));
    fs.appendChild(g); host.appendChild(fs);

    s.cols.forEach(function(col, ci){
      const fc = H.fieldset("Column "+(ci+1));
      const top = document.createElement("div"); top.className="grid2";
      top.appendChild(H.fld("Heading", col, "head"));
      const al = document.createElement("div");
      const lab = document.createElement("label"); lab.textContent="Header colour"; al.appendChild(lab);
      const sel = document.createElement("select");
      [["maroon","Maroon"],["gold","Gold"]].forEach(function(o){
        const op=document.createElement("option"); op.value=o[0]; op.textContent=o[1];
        if(col.accent===o[0]) op.selected=true; sel.appendChild(op);
      });
      sel.onchange=function(){ col.accent=sel.value; H.refreshLight(); };
      al.appendChild(sel); top.appendChild(al);
      fc.appendChild(top);
      col.items.forEach(function(v,i){
        const r=document.createElement("div"); r.className="rowline t2";
        const a=document.createElement("input"); a.value=v; a.placeholder="Point"; a.style.gridColumn="1 / span 2";
        a.oninput=function(){ col.items[i]=a.value; H.refreshLight(); };
        const x=document.createElement("button"); x.className="delrow"; x.textContent="\u2715";
        x.onclick=function(){ col.items.splice(i,1); H.refreshAll(); };
        r.appendChild(a); r.appendChild(x); fc.appendChild(r);
      });
      const addP=document.createElement("button"); addP.className="btn ghost addbtn"; addP.textContent="+ Add point";
      addP.onclick=function(){ col.items.push(""); H.refreshAll(); };
      fc.appendChild(addP);
      if(s.cols.length>2){
        const del=document.createElement("button"); del.className="btn ghost addbtn"; del.textContent="Remove this column"; del.style.marginLeft="8px";
        del.onclick=function(){ s.cols.splice(ci,1); H.refreshAll(); };
        fc.appendChild(del);
      }
      host.appendChild(fc);
    });
    if(s.cols.length<3){
      const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add column";
      add.onclick=function(){ s.cols.push({head:"Option", items:["point"], accent:"gold"}); H.refreshAll(); };
      host.appendChild(add);
    }
  },

  preview: function(s, host, H){
    const PV = H.pv, TH = H.TH;
    PV.headerBar(host, s.title, s.sub);
    const cols = s.cols||[]; const n = cols.length||1;
    const gap = 0.3, total = 9.1, w = (total - gap*(n-1))/n;
    cols.forEach(function(col,i){
      const x = 0.45 + i*(w+gap);
      const acc = col.accent==="gold"?TH.GOLD:TH.MAROON;
      PV.box(host,{x:x,y:1.25,w:w,h:0.6,bg:acc,radius:true});
      PV.text(host,{x:x,y:1.25,w:w,h:0.6,text:col.head||"",size:13,bold:true,color:"FFFFFF",align:"center",valign:"middle"});
      PV.box(host,{x:x,y:1.95,w:w,h:3.2,bg:TH.CARD,line:TH.GOLD,radius:true});
      (col.items||[]).forEach(function(it,j){
        var yy = 2.1 + j*0.5;
        PV.text(host,{x:x+0.15,y:yy,w:0.25,h:0.5,text:"\u2022",size:12,bold:true,color:acc,valign:"middle"});
        PV.text(host,{x:x+0.42,y:yy,w:w-0.55,h:0.5,text:it||"",size:11,color:TH.INK,valign:"middle"});
      });
    });
  },

  pptx: function(pres, s, d, H){
    const TH = H.TH;
    s.background = {color:TH.CREAM};
    H.headerBar(pres, s, d.title, d.sub);
    const cols = d.cols||[]; const n = cols.length||1;
    const gap = 0.3, total = 9.1, w = (total - gap*(n-1))/n;
    cols.forEach(function(col,i){
      const x = 0.45 + i*(w+gap);
      const acc = col.accent==="gold"?TH.GOLD:TH.MAROON;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:1.25,w:w,h:0.6,rectRadius:0.07,fill:{color:acc}});
      s.addText(col.head||"",{x:x,y:1.25,w:w,h:0.6,fontFace:TH.FONT,fontSize:13,bold:true,color:"FFFFFF",align:"center",valign:"middle",margin:0});
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:1.95,w:w,h:3.2,rectRadius:0.08,fill:{color:TH.CARD},line:{color:TH.GOLD,width:1}});
      (col.items||[]).forEach(function(it,j){
        var yy = 2.1 + j*0.48;
        s.addText("\u2022",{x:x+0.15,y:yy,w:0.25,h:0.48,fontFace:TH.FONT,fontSize:12,bold:true,color:acc,valign:"middle",margin:0});
        s.addText(it||"",{x:x+0.42,y:yy,w:w-0.55,h:0.48,fontFace:TH.FONT,fontSize:11,color:TH.INK,valign:"middle",margin:0});
      });
    });
  }
});
