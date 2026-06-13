/* template-pyramid.js — stacked levels (priorities, foundation->top). Adaptive to level count. */
OWOF.registerTemplate({
  type:"pyramid", label:"Pyramid / layers",
  defaults:function(){ return {type:"pyramid", title:"Priorities", sub:"",
    levels:[{label:"Top priority"},{label:"Middle"},{label:"Foundation"}]}; },
  editor:function(s,host,H){
    const fs=H.fieldset("Header"); const g=document.createElement("div"); g.className="grid2";
    g.appendChild(H.fld("Title",s,"title")); g.appendChild(H.fld("Subtitle",s,"sub")); fs.appendChild(g); host.appendChild(fs);
    const fs2=H.fieldset("Levels top→bottom — add or remove (2 to 6)");
    s.levels.forEach(function(lv,i){ const r=document.createElement("div"); r.className="rowline t2";
      const a=document.createElement("input"); a.value=lv.label; a.placeholder="Level label"; a.style.gridColumn="1 / span 2"; a.oninput=function(){lv.label=a.value;H.refreshLight();};
      const x=document.createElement("button"); x.className="delrow"; x.textContent="\u2715"; x.onclick=function(){s.levels.splice(i,1);H.refreshAll();};
      r.appendChild(a);r.appendChild(x); fs2.appendChild(r); });
    if(s.levels.length<6){ const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add level";
      add.onclick=function(){s.levels.push({label:""});H.refreshAll();}; fs2.appendChild(add); }
    host.appendChild(fs2);
  },
  _shade:function(i,n,TH){ var cols=[TH.MAROON,"A33A2A","B85042","C9A227","D4B445"]; return cols[Math.min(i,cols.length-1)]; },
  preview:function(s,host,H){ const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,s.sub);
    var lv=s.levels||[],n=lv.length||1, gap=0.12, topY=1.4, totalH=3.5, h=(totalH-gap*(n-1))/n, cx=5.0, maxW=7.0, minW=2.4;
    lv.forEach(function(l,i){ var w=minW+(maxW-minW)*(i/(Math.max(1,n-1))); var x=cx-w/2; var y=topY+i*(h+gap);
      PV.box(host,{x:x,y:y,w:w,h:h,bg:this._shade(i,n,TH),radius:true});
      PV.text(host,{x:x,y:y,w:w,h:h,text:l.label||"",size:H.fitText(l.label,w-0.3,h,13,9),bold:true,color:"FFFFFF",align:"center",valign:"middle"});
    }.bind(this));
  },
  pptx:function(pres,s,d,H){ const TH=H.TH; s.background={color:TH.CREAM}; H.headerBar(pres,s,d.title,d.sub);
    var lv=d.levels||[],n=lv.length||1, gap=0.12, topY=1.4, totalH=3.5, h=(totalH-gap*(n-1))/n, cx=5.0, maxW=7.0, minW=2.4;
    lv.forEach(function(l,i){ var w=minW+(maxW-minW)*(i/(Math.max(1,n-1))); var x=cx-w/2; var y=topY+i*(h+gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:w,h:h,rectRadius:0.05,fill:{color:this._shade(i,n,TH)}});
      s.addText(l.label||"",{x:x,y:y,w:w,h:h,fontFace:TH.FONT,fontSize:H.fitText(l.label,w-0.3,h,13,9),bold:true,color:"FFFFFF",align:"center",valign:"middle",margin:0});
    }.bind(this));
  }
});
