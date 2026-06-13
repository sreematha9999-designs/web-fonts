/* template-process.js — horizontal step flow with arrows. Adaptive to step count + label length. */
OWOF.registerTemplate({
  type:"process", label:"Process / flow",
  defaults:function(){ return {type:"process", title:"Process", sub:"",
    steps:[{label:"Step 1",sub:""},{label:"Step 2",sub:""},{label:"Step 3",sub:""}]}; },
  editor:function(s,host,H){
    const fs=H.fieldset("Header"); const g=document.createElement("div"); g.className="grid2";
    g.appendChild(H.fld("Title",s,"title")); g.appendChild(H.fld("Subtitle",s,"sub")); fs.appendChild(g); host.appendChild(fs);
    const fs2=H.fieldset("Steps — add or remove (2 to 6)");
    s.steps.forEach(function(st,i){ const r=document.createElement("div"); r.className="rowline t2";
      const a=document.createElement("input"); a.value=st.label; a.placeholder="Step"; a.oninput=function(){st.label=a.value;H.refreshLight();};
      const b=document.createElement("input"); b.value=st.sub; b.placeholder="Detail (optional)"; b.oninput=function(){st.sub=b.value;H.refreshLight();};
      const x=document.createElement("button"); x.className="delrow"; x.textContent="\u2715"; x.onclick=function(){s.steps.splice(i,1);H.refreshAll();};
      r.appendChild(a);r.appendChild(b);r.appendChild(x); fs2.appendChild(r); });
    if(s.steps.length<6){ const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add step";
      add.onclick=function(){s.steps.push({label:"",sub:""});H.refreshAll();}; fs2.appendChild(add); }
    if(s.steps.length>=6) H.warnBox(fs2,"6 steps is the comfortable maximum across one row.");
    host.appendChild(fs2);
  },
  preview:function(s,host,H){ const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,s.sub);
    var steps=s.steps||[],n=steps.length||1, gap=0.35, w=(9.1-gap*(n-1))/n, y=2.3, h=1.3;
    steps.forEach(function(st,i){ var x=0.45+i*(w+gap);
      PV.box(host,{x:x,y:y,w:w,h:h,bg:TH.CARD,line:TH.GOLD,radius:true,shadow:true});
      PV.box(host,{x:x+w/2-0.22,y:y-0.22,w:0.44,h:0.44,bg:TH.MAROON,line:TH.GOLD,lineW:0.2}).style.borderRadius="50%";
      PV.text(host,{x:x+w/2-0.22,y:y-0.22,w:0.44,h:0.44,text:String(i+1),size:14,bold:true,color:TH.GOLD,align:"center",valign:"middle"});
      PV.rich(host,{x:x+0.1,y:y+0.15,w:w-0.2,h:h-0.2,align:"center",valign:"middle"},[
        {text:st.label||"",size:H.fitText(st.label,w-0.3,0.5,12.5,9),bold:true,color:TH.MAROON,block:true},
        {text:st.sub||"",size:9,color:TH.MUTED,block:true}]);
      if(i<n-1) PV.text(host,{x:x+w,y:y,w:gap,h:h,text:"\u2794",size:16,bold:true,color:TH.GOLD,align:"center",valign:"middle"});
    });
  },
  pptx:function(pres,s,d,H){ const TH=H.TH; s.background={color:TH.CREAM}; H.headerBar(pres,s,d.title,d.sub);
    var steps=d.steps||[],n=steps.length||1, gap=0.35, w=(9.1-gap*(n-1))/n, y=2.3, h=1.3;
    steps.forEach(function(st,i){ var x=0.45+i*(w+gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:w,h:h,rectRadius:0.09,fill:{color:TH.CARD},line:{color:TH.GOLD,width:1},shadow:H.shadow()});
      s.addShape(pres.shapes.OVAL,{x:x+w/2-0.22,y:y-0.22,w:0.44,h:0.44,fill:{color:TH.MAROON},line:{color:TH.GOLD,width:1.5}});
      s.addText(String(i+1),{x:x+w/2-0.22,y:y-0.22,w:0.44,h:0.44,fontFace:TH.FONT,fontSize:14,bold:true,color:TH.GOLD,align:"center",valign:"middle",margin:0});
      s.addText([{text:st.label||"",options:{fontSize:H.fitText(st.label,w-0.3,0.5,12.5,9),bold:true,color:TH.MAROON,breakLine:true}},
                 {text:st.sub||"",options:{fontSize:9,color:TH.MUTED}}],
        {x:x+0.1,y:y+0.15,w:w-0.2,h:h-0.2,fontFace:TH.FONT,align:"center",valign:"middle",lineSpacing:13});
      if(i<n-1) s.addText("\u2794",{x:x+w,y:y,w:gap,h:h,fontFace:TH.FONT,fontSize:16,bold:true,color:TH.GOLD,align:"center",valign:"middle",margin:0});
    });
  }
});
