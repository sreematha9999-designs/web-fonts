/* template-divider.js — section break. Variants: number-left / centered / band.
   Flexible stat cards (0-5, add/remove) with autoGrid reflow + fitText. */
OWOF.registerTemplate({
  type:"divider", label:"Project divider",
  variants:[{id:"left",label:"Number left"},{id:"center",label:"Centered"},{id:"band",label:"Band"}],
  defaults:function(){ return {type:"divider", variant:"left", num:"01", name:"Project Name",
    sub:"One-line context · Month 2026",
    stats:[{v:"xx%",l:"Overall Progress"},{v:"xx",l:"Key fact"},{v:"xx",l:"Next milestone"}]}; },

  editor:function(s,host,H){
    const fs=H.fieldset("Divider content");
    const g=document.createElement("div"); g.className="grid3";
    g.appendChild(H.fld("Number (optional)",s,"num")); g.appendChild(H.fld("Name",s,"name")); g.appendChild(H.fld("Subtitle",s,"sub"));
    fs.appendChild(g); host.appendChild(fs);
    const fs2=H.fieldset("Stat cards — add or remove (0 to 5)");
    s.stats.forEach(function(st,i){
      const r=document.createElement("div"); r.className="rowline t2";
      const a=document.createElement("input"); a.value=st.v; a.placeholder="Big value"; a.oninput=function(){st.v=a.value;H.refreshLight();};
      const b=document.createElement("input"); b.value=st.l; b.placeholder="Small label"; b.oninput=function(){st.l=b.value;H.refreshLight();};
      const x=document.createElement("button"); x.className="delrow"; x.textContent="\u2715"; x.onclick=function(){s.stats.splice(i,1);H.refreshAll();};
      r.appendChild(a);r.appendChild(b);r.appendChild(x); fs2.appendChild(r);
    });
    if(s.stats.length<5){ const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add card";
      add.onclick=function(){s.stats.push({v:"",l:""});H.refreshAll();}; fs2.appendChild(add); }
    if(s.stats.length>=5) H.warnBox(fs2,"5 cards is the comfortable maximum for a divider — for more, a KPI slide works better.");
    host.appendChild(fs2);
  },

  _cards:function(api,s,H,y){ const TH=H.TH; var n=(s.stats||[]).length; if(!n) return;
    var gap=0.2, w=Math.min(2.95,(9.1-gap*(n-1))/n);
    var totalW=n*w+(n-1)*gap, x0=(10-totalW)/2;
    (s.stats||[]).forEach(function(st,i){ var x=x0+i*(w+gap);
      api.card(x,y,w,1.5, st.v||"", st.l||"", (st.v||"").indexOf("xx")>=0);
    });
  },

  preview:function(s,host,H){ const v=s.variant||"left";
    if(v==="center") this._pv(s,host,H,"center");
    else if(v==="band") this._pv(s,host,H,"band");
    else this._pv(s,host,H,"left");
  },
  _pv:function(s,host,H,mode){ const PV=H.pv,TH=H.TH;
    PV.logo(host,false);
    if(mode==="left"){
      PV.text(host,{x:0.45,y:0.85,w:3.0,h:1.5,text:s.num||"",size:88,bold:true,color:TH.GOLD});
      PV.box(host,{x:0.5,y:2.45,w:1.4,h:0.05,bg:TH.MAROON});
      PV.box(host,{x:2.7,y:0.95,w:6.85,h:1.7,bg:TH.MAROON,radius:true,shadow:true});
      PV.rich(host,{x:3.0,y:1.1,w:6.3,h:1.4,valign:"middle"},[
        {text:(s.name||"").toUpperCase(),size:H.fitText(s.name,6.0,1.0,24,14),bold:true,color:"FFFFFF",block:true},
        {text:s.sub||"",size:11.5,bold:true,color:TH.GOLD,block:true}]);
    } else if(mode==="center"){
      if(s.num) PV.text(host,{x:0,y:0.7,w:10,h:1.1,text:s.num,size:60,bold:true,color:TH.GOLD,align:"center"});
      PV.text(host,{x:1,y:1.85,w:8,h:0.7,text:(s.name||"").toUpperCase(),size:H.fitText(s.name,7.5,0.7,28,16),bold:true,color:TH.DMAROON,align:"center"});
      PV.text(host,{x:1,y:2.5,w:8,h:0.4,text:s.sub||"",size:12,bold:true,color:TH.GOLD,align:"center"});
    } else {
      PV.box(host,{x:0,y:0.85,w:10,h:1.8,bg:TH.MAROON});
      PV.box(host,{x:0,y:0.82,w:10,h:0.04,bg:TH.GOLD});
      PV.rich(host,{x:0.6,y:0.95,w:8.8,h:1.6,valign:"middle"},[
        {text:(s.num?s.num+"  ":"")+(s.name||"").toUpperCase(),size:H.fitText(s.name,8.5,0.9,26,15),bold:true,color:"FFFFFF",block:true},
        {text:s.sub||"",size:12,bold:true,color:TH.GOLD,block:true}]);
    }
    this._cards({card:function(x,y,w,h,v,l,ph){
      PV.box(host,{x:x,y:y,w:w,h:h,bg:TH.CARD,line:TH.GOLD,radius:true,shadow:true});
      PV.rich(host,{x:x+0.1,y:y,w:w-0.2,h:h,align:"center",valign:"middle"},[
        {text:v,size:H.fitText(v,w-0.3,0.5,15,10),bold:true,color:ph?TH.GRAY:TH.MAROON,block:true},
        {text:l,size:9.5,color:TH.MUTED,block:true}]);
    }},s,H,3.25);
  },

  pptx:function(pres,s,d,H){ const TH=H.TH; s.background={color:TH.CREAM}; H.logoChip(pres,s,false);
    var mode=d.variant||"left";
    if(mode==="left"){
      s.addText(d.num||"",{x:0.45,y:0.85,w:3.0,h:1.5,fontFace:TH.FONT,fontSize:88,bold:true,color:TH.GOLD,margin:0});
      s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:2.45,w:1.4,h:0.05,fill:{color:TH.MAROON}});
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:2.7,y:0.95,w:6.85,h:1.7,rectRadius:0.1,fill:{color:TH.MAROON},shadow:H.shadow()});
      s.addText([{text:(d.name||"").toUpperCase(),options:{fontSize:H.fitText(d.name,6.0,1.0,24,14),bold:true,color:"FFFFFF",breakLine:true}},
                 {text:d.sub||"",options:{fontSize:11.5,bold:true,color:TH.GOLD}}],
        {x:3.0,y:1.1,w:6.3,h:1.4,fontFace:TH.FONT,valign:"middle",lineSpacing:24,margin:0});
    } else if(mode==="center"){
      if(d.num) s.addText(d.num,{x:0,y:0.7,w:10,h:1.1,fontFace:TH.FONT,fontSize:60,bold:true,color:TH.GOLD,align:"center",margin:0});
      s.addText((d.name||"").toUpperCase(),{x:1,y:1.85,w:8,h:0.7,fontFace:TH.FONT,fontSize:H.fitText(d.name,7.5,0.7,28,16),bold:true,color:TH.DMAROON,align:"center",margin:0});
      s.addText(d.sub||"",{x:1,y:2.5,w:8,h:0.4,fontFace:TH.FONT,fontSize:12,bold:true,color:TH.GOLD,align:"center",margin:0});
    } else {
      s.addShape(pres.shapes.RECTANGLE,{x:0,y:0.85,w:10,h:1.8,fill:{color:TH.MAROON}});
      s.addShape(pres.shapes.RECTANGLE,{x:0,y:0.82,w:10,h:0.04,fill:{color:TH.GOLD}});
      s.addText([{text:(d.num?d.num+"  ":"")+(d.name||"").toUpperCase(),options:{fontSize:H.fitText(d.name,8.5,0.9,26,15),bold:true,color:"FFFFFF",breakLine:true}},
                 {text:d.sub||"",options:{fontSize:12,bold:true,color:TH.GOLD}}],
        {x:0.6,y:0.95,w:8.8,h:1.6,fontFace:TH.FONT,valign:"middle",lineSpacing:20,margin:0});
    }
    this._cards({card:function(x,y,w,h,v,l,ph){
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:w,h:h,rectRadius:0.09,fill:{color:TH.CARD},line:{color:TH.GOLD,width:1},shadow:H.shadow()});
      s.addText([{text:v,options:{fontSize:H.fitText(v,w-0.3,0.5,15,10),bold:true,color:ph?TH.GRAY:TH.MAROON,breakLine:true}},
                 {text:l,options:{fontSize:9.5,color:TH.MUTED}}],
        {x:x+0.1,y:y,w:w-0.2,h:h,fontFace:TH.FONT,align:"center",valign:"middle",lineSpacing:16});
    }},d,H,3.25);
  }
});
