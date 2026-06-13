/* template-hierarchy.js — simple org tree: one top box, a row of children. Adaptive to child count. */
OWOF.registerTemplate({
  type:"hierarchy", label:"Hierarchy / org",
  defaults:function(){ return {type:"hierarchy", title:"Structure", sub:"", top:"Leadership",
    children:[{label:"Team A"},{label:"Team B"},{label:"Team C"}]}; },
  editor:function(s,host,H){
    const fs=H.fieldset("Header"); const g=document.createElement("div"); g.className="grid2";
    g.appendChild(H.fld("Title",s,"title")); g.appendChild(H.fld("Subtitle",s,"sub")); fs.appendChild(g);
    fs.appendChild(H.fld("Top box label",s,"top")); host.appendChild(fs);
    const fs2=H.fieldset("Reporting boxes — add or remove (2 to 6)");
    s.children.forEach(function(c,i){ const r=document.createElement("div"); r.className="rowline t2";
      const a=document.createElement("input"); a.value=c.label; a.placeholder="Box label"; a.style.gridColumn="1 / span 2"; a.oninput=function(){c.label=a.value;H.refreshLight();};
      const x=document.createElement("button"); x.className="delrow"; x.textContent="\u2715"; x.onclick=function(){s.children.splice(i,1);H.refreshAll();};
      r.appendChild(a);r.appendChild(x); fs2.appendChild(r); });
    if(s.children.length<6){ const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add box";
      add.onclick=function(){s.children.push({label:""});H.refreshAll();}; fs2.appendChild(add); }
    host.appendChild(fs2);
  },
  preview:function(s,host,H){ const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,s.sub);
    var topW=3.0,topX=5.0-topW/2,topY=1.4,topH=0.9;
    PV.box(host,{x:topX,y:topY,w:topW,h:topH,bg:TH.MAROON,radius:true,shadow:true});
    PV.text(host,{x:topX,y:topY,w:topW,h:topH,text:s.top||"",size:H.fitText(s.top,topW-0.3,topH,15,10),bold:true,color:"FFFFFF",align:"center",valign:"middle"});
    var ch=s.children||[],n=ch.length||1, gap=0.25, w=(9.1-gap*(n-1))/n, y=3.4, h=1.0;
    PV.box(host,{x:5.0-0.01,y:topY+topH,w:0.03,h:y-(topY+topH),bg:TH.GOLD});
    ch.forEach(function(c,i){ var x=0.45+i*(w+gap);
      PV.box(host,{x:x+w/2-0.015,y:topY+topH+0.25,w:0.03,h:y-(topY+topH+0.25),bg:TH.GOLD});
      PV.box(host,{x:x,y:y,w:w,h:h,bg:TH.CARD,line:TH.GOLD,radius:true,shadow:true});
      PV.text(host,{x:x+0.08,y:y,w:w-0.16,h:h,text:c.label||"",size:H.fitText(c.label,w-0.3,h,12,8.5),bold:true,color:TH.MAROON,align:"center",valign:"middle"});
    });
  },
  pptx:function(pres,s,d,H){ const TH=H.TH; s.background={color:TH.CREAM}; H.headerBar(pres,s,d.title,d.sub);
    var topW=3.0,topX=5.0-topW/2,topY=1.4,topH=0.9;
    var ch=d.children||[],n=ch.length||1, gap=0.25, w=(9.1-gap*(n-1))/n, y=3.4, h=1.0;
    s.addShape(pres.shapes.RECTANGLE,{x:5.0-0.015,y:topY+topH,w:0.03,h:0.25,fill:{color:TH.GOLD}});
    var lx=0.45+w/2, rx=0.45+(n-1)*(w+gap)+w/2;
    if(n>1) s.addShape(pres.shapes.RECTANGLE,{x:lx,y:topY+topH+0.25,w:rx-lx,h:0.03,fill:{color:TH.GOLD}});
    ch.forEach(function(c,i){ var x=0.45+i*(w+gap);
      s.addShape(pres.shapes.RECTANGLE,{x:x+w/2-0.015,y:topY+topH+0.25,w:0.03,h:y-(topY+topH+0.25),fill:{color:TH.GOLD}});
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:w,h:h,rectRadius:0.08,fill:{color:TH.CARD},line:{color:TH.GOLD,width:1},shadow:H.shadow()});
      s.addText(c.label||"",{x:x+0.08,y:y,w:w-0.16,h:h,fontFace:TH.FONT,fontSize:H.fitText(c.label,w-0.3,h,12,8.5),bold:true,color:TH.MAROON,align:"center",valign:"middle",margin:0});
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:topX,y:topY,w:topW,h:topH,rectRadius:0.09,fill:{color:TH.MAROON},shadow:H.shadow()});
    s.addText(d.top||"",{x:topX,y:topY,w:topW,h:topH,fontFace:TH.FONT,fontSize:H.fitText(d.top,topW-0.3,topH,15,10),bold:true,color:"FFFFFF",align:"center",valign:"middle",margin:0});
  }
});
