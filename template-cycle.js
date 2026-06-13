/* template-cycle.js — circular process. Adaptive: nodes evenly on a ring with curved arrows implied. */
OWOF.registerTemplate({
  type:"cycle", label:"Cycle (circular)",
  defaults:function(){ return {type:"cycle", title:"Cycle", sub:"",
    nodes:[{label:"Plan"},{label:"Do"},{label:"Check"},{label:"Act"}]}; },
  editor:function(s,host,H){
    const fs=H.fieldset("Header"); const g=document.createElement("div"); g.className="grid2";
    g.appendChild(H.fld("Title",s,"title")); g.appendChild(H.fld("Subtitle",s,"sub")); fs.appendChild(g); host.appendChild(fs);
    const fs2=H.fieldset("Stages — add or remove (3 to 7)");
    s.nodes.forEach(function(nd,i){ const r=document.createElement("div"); r.className="rowline t2";
      const a=document.createElement("input"); a.value=nd.label; a.placeholder="Stage"; a.style.gridColumn="1 / span 2"; a.oninput=function(){nd.label=a.value;H.refreshLight();};
      const x=document.createElement("button"); x.className="delrow"; x.textContent="\u2715"; x.onclick=function(){s.nodes.splice(i,1);H.refreshAll();};
      r.appendChild(a);r.appendChild(x); fs2.appendChild(r); });
    if(s.nodes.length<7){ const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add stage";
      add.onclick=function(){s.nodes.push({label:""});H.refreshAll();}; fs2.appendChild(add); }
    host.appendChild(fs2);
  },
  _g:function(){ return {cx:5.0,cy:3.2,rx:3.0,ry:1.6}; },
  preview:function(s,host,H){ const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,s.sub);
    var nd=s.nodes||[],n=nd.length||1,g=this._g(), w=1.6,h=0.75;
    nd.forEach(function(p,i){ var ang=-Math.PI/2+i*(2*Math.PI/n);
      var x=g.cx+g.rx*Math.cos(ang)-w/2, y=g.cy+g.ry*Math.sin(ang)-h/2;
      PV.box(host,{x:x,y:y,w:w,h:h,bg:(i===0?TH.MAROON:TH.CARD),line:TH.GOLD,radius:true,shadow:true});
      PV.text(host,{x:x+0.05,y:y,w:w-0.1,h:h,text:p.label||"",size:H.fitText(p.label,w-0.2,h,10.5,7.5),bold:true,color:(i===0?TH.GOLD:TH.MAROON),align:"center",valign:"middle"});
    });
    PV.text(host,{x:g.cx-0.5,y:g.cy-0.3,w:1.0,h:0.6,text:"\u21BB",size:34,color:TH.GOLD,align:"center",valign:"middle"});
  },
  pptx:function(pres,s,d,H){ const TH=H.TH; s.background={color:TH.CREAM}; H.headerBar(pres,s,d.title,d.sub);
    var nd=d.nodes||[],n=nd.length||1,g=this._g(), w=1.6,h=0.75;
    nd.forEach(function(p,i){ var a1=-Math.PI/2+i*(2*Math.PI/n), a2=-Math.PI/2+((i+1)%n)*(2*Math.PI/n);
      var x1=g.cx+g.rx*Math.cos(a1), y1=g.cy+g.ry*Math.sin(a1), x2=g.cx+g.rx*Math.cos(a2), y2=g.cy+g.ry*Math.sin(a2);
      H.connector(pres,s,x1,y1,x2,y2,TH.GOLD,1.5);
    });
    nd.forEach(function(p,i){ var ang=-Math.PI/2+i*(2*Math.PI/n);
      var x=g.cx+g.rx*Math.cos(ang)-w/2, y=g.cy+g.ry*Math.sin(ang)-h/2;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:w,h:h,rectRadius:0.07,fill:{color:(i===0?TH.MAROON:TH.CARD)},line:{color:TH.GOLD,width:1},shadow:H.shadow()});
      s.addText(p.label||"",{x:x+0.05,y:y,w:w-0.1,h:h,fontFace:TH.FONT,fontSize:H.fitText(p.label,w-0.2,h,10.5,7.5),bold:true,color:(i===0?TH.GOLD:TH.MAROON),align:"center",valign:"middle",margin:0});
    });
  }
});
