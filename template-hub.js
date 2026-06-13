/* template-hub.js — central idea with spokes around it. Adaptive: spokes placed on a circle. */
OWOF.registerTemplate({
  type:"hub", label:"Hub & spokes",
  defaults:function(){ return {type:"hub", title:"Overview", sub:"", center:"Core",
    spokes:[{label:"Area 1"},{label:"Area 2"},{label:"Area 3"},{label:"Area 4"}]}; },
  editor:function(s,host,H){
    const fs=H.fieldset("Header"); const g=document.createElement("div"); g.className="grid2";
    g.appendChild(H.fld("Title",s,"title")); g.appendChild(H.fld("Subtitle",s,"sub")); fs.appendChild(g);
    fs.appendChild(H.fld("Center label",s,"center")); host.appendChild(fs);
    const fs2=H.fieldset("Spokes — add or remove (3 to 8)");
    s.spokes.forEach(function(sp,i){ const r=document.createElement("div"); r.className="rowline t2";
      const a=document.createElement("input"); a.value=sp.label; a.placeholder="Spoke label"; a.style.gridColumn="1 / span 2"; a.oninput=function(){sp.label=a.value;H.refreshLight();};
      const x=document.createElement("button"); x.className="delrow"; x.textContent="\u2715"; x.onclick=function(){s.spokes.splice(i,1);H.refreshAll();};
      r.appendChild(a);r.appendChild(x); fs2.appendChild(r); });
    if(s.spokes.length<8){ const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add spoke";
      add.onclick=function(){s.spokes.push({label:""});H.refreshAll();}; fs2.appendChild(add); }
    host.appendChild(fs2);
  },
  _geom:function(n){ var cx=5.0, cy=3.1, rx=3.2, ry=1.7; return {cx:cx,cy:cy,rx:rx,ry:ry}; },
  preview:function(s,host,H){ const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,s.sub);
    var sp=s.spokes||[],n=sp.length||1, g=this._geom(n), sw=1.7, sh=0.7;
    sp.forEach(function(p,i){ var ang=-Math.PI/2+i*(2*Math.PI/n);
      var x=g.cx+g.rx*Math.cos(ang)-sw/2, y=g.cy+g.ry*Math.sin(ang)-sh/2;
      PV.box(host,{x:x,y:y,w:sw,h:sh,bg:TH.CARD,line:TH.GOLD,radius:true,shadow:true});
      PV.text(host,{x:x+0.05,y:y,w:sw-0.1,h:sh,text:p.label||"",size:H.fitText(p.label,sw-0.2,sh,10,7.5),bold:true,color:TH.MAROON,align:"center",valign:"middle"});
    });
    var c=PV.box(host,{x:g.cx-0.9,y:g.cy-0.55,w:1.8,h:1.1,bg:TH.MAROON,line:TH.GOLD,lineW:0.25,radius:true,shadow:true});
    PV.text(host,{x:g.cx-0.85,y:g.cy-0.55,w:1.7,h:1.1,text:s.center||"",size:H.fitText(s.center,1.5,1.0,15,10),bold:true,color:TH.GOLD,align:"center",valign:"middle"});
  },
  pptx:function(pres,s,d,H){ const TH=H.TH; s.background={color:TH.CREAM}; H.headerBar(pres,s,d.title,d.sub);
    var sp=d.spokes||[],n=sp.length||1, g=this._geom(n), sw=1.7, sh=0.7;
    sp.forEach(function(p,i){ var ang=-Math.PI/2+i*(2*Math.PI/n);
      var x=g.cx+g.rx*Math.cos(ang)-sw/2, y=g.cy+g.ry*Math.sin(ang)-sh/2;
      H.connector(pres,s,g.cx,g.cy,x+sw/2,y+sh/2,TH.GOLD,1.5);
    });
    sp.forEach(function(p,i){ var ang=-Math.PI/2+i*(2*Math.PI/n);
      var x=g.cx+g.rx*Math.cos(ang)-sw/2, y=g.cy+g.ry*Math.sin(ang)-sh/2;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:sw,h:sh,rectRadius:0.07,fill:{color:TH.CARD},line:{color:TH.GOLD,width:1},shadow:H.shadow()});
      s.addText(p.label||"",{x:x+0.05,y:y,w:sw-0.1,h:sh,fontFace:TH.FONT,fontSize:H.fitText(p.label,sw-0.2,sh,10,7.5),bold:true,color:TH.MAROON,align:"center",valign:"middle",margin:0});
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:g.cx-0.9,y:g.cy-0.55,w:1.8,h:1.1,rectRadius:0.09,fill:{color:TH.MAROON},line:{color:TH.GOLD,width:2},shadow:H.shadow()});
    s.addText(d.center||"",{x:g.cx-0.85,y:g.cy-0.55,w:1.7,h:1.1,fontFace:TH.FONT,fontSize:H.fitText(d.center,1.5,1.0,15,10),bold:true,color:TH.GOLD,align:"center",valign:"middle",margin:0});
  }
});
