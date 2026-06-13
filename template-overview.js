/* template-overview.js — summary. Variants: cards-top / sidebar / band-only.
   Flexible stat cards (2-6, add/remove) with autoGrid reflow + fitText. */
OWOF.registerTemplate({
  type:"overview", label:"Project overview",
  variants:[{id:"top",label:"Cards on top"},{id:"sidebar",label:"Cards sidebar"},{id:"bandonly",label:"Text + band"}],
  defaults:function(){ return {type:"overview", variant:"top", title:"Project Overview", sub:"Name · Month 2026",
    stats:[{v:"xx sq.ft.",l:"Built-up Area"},{v:"Rs. xx Cr",l:"Approved Budget"},{v:"Rs. xx Cr",l:"Spent"},{v:"xx Months",l:"Duration"}],
    para:"One short paragraph describing the project.", band1:"HIGHLIGHT LINE IN CAPS", band2:"supporting line"}; },

  editor:function(s,host,H){
    const fs=H.fieldset("Header");
    const g=document.createElement("div"); g.className="grid2";
    g.appendChild(H.fld("Title",s,"title")); g.appendChild(H.fld("Subtitle",s,"sub"));
    fs.appendChild(g); host.appendChild(fs);
    const fs2=H.fieldset("Stat cards — add or remove (2 to 6)");
    s.stats.forEach(function(st,i){
      const r=document.createElement("div"); r.className="rowline t2";
      const a=document.createElement("input"); a.value=st.v; a.placeholder="Value"; a.oninput=function(){st.v=a.value;H.refreshLight();};
      const b=document.createElement("input"); b.value=st.l; b.placeholder="Label"; b.oninput=function(){st.l=b.value;H.refreshLight();};
      const x=document.createElement("button"); x.className="delrow"; x.textContent="\u2715"; x.onclick=function(){s.stats.splice(i,1);H.refreshAll();};
      r.appendChild(a);r.appendChild(b);r.appendChild(x); fs2.appendChild(r);
    });
    if(s.stats.length<6){ const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add card";
      add.onclick=function(){s.stats.push({v:"",l:""});H.refreshAll();}; fs2.appendChild(add); }
    if(s.stats.length>=6) H.warnBox(fs2,"6 cards fills the row nicely; more will shrink. A KPI slide suits long lists better.");
    host.appendChild(fs2);
    const fs3=H.fieldset("Description & highlight band");
    fs3.appendChild(H.fld("Paragraph",s,"para",{area:true,rows:4}));
    fs3.appendChild(H.fld("Band line 1 (gold, caps)",s,"band1"));
    fs3.appendChild(H.fld("Band line 2 (white)",s,"band2"));
    host.appendChild(fs3);
  },

  preview:function(s,host,H){ const v=s.variant||"top";
    if(v==="sidebar") this._sidebar(s,host,H);
    else if(v==="bandonly") this._bandonly(s,host,H);
    else this._top(s,host,H);
  },
  _statCardPV:function(host,H,x,y,w,h,st,small){ const PV=H.pv,TH=H.TH;
    PV.box(host,{x:x,y:y,w:w,h:h,bg:TH.CARD,line:TH.GOLD,radius:true,shadow:true});
    PV.rich(host,{x:x+0.08,y:y,w:w-0.16,h:h,align:"center",valign:"middle"},[
      {text:st.v||"",size:H.fitText(st.v,w-0.25,h*0.5,small?13:15,9),bold:true,color:(st.v||"").indexOf("xx")>=0?TH.GRAY:TH.MAROON,block:true},
      {text:st.l||"",size:small?7.5:8.5,color:TH.MUTED,block:true}]);
  },
  _top:function(s,host,H){ const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,s.sub);
    var n=(s.stats||[]).length||1, gap=0.2, w=(9.1-gap*(n-1))/n;
    (s.stats||[]).forEach(function(st,i){ this._statCardPV(host,H,0.45+i*(w+gap),1.15,w,1.0,st,n>4); }.bind(this));
    PV.text(host,{x:0.45,y:2.45,w:9.1,h:1.0,text:s.para||"",size:12,color:TH.INK});
    PV.box(host,{x:0.45,y:3.7,w:9.1,h:1.35,bg:TH.MAROON,radius:true,shadow:true});
    PV.rich(host,{x:0.8,y:3.85,w:8.4,h:1.05,valign:"middle"},[
      {text:(s.band1||"").toUpperCase(),size:13,bold:true,color:TH.GOLD,block:true},
      {text:s.band2||"",size:11,color:"FFFFFF",block:true}]);
  },
  _sidebar:function(s,host,H){ const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,s.sub);
    var n=(s.stats||[]).length||1, gap=0.15, h=Math.min(1.0,(3.9-gap*(n-1))/n);
    (s.stats||[]).forEach(function(st,i){ this._statCardPV(host,H,6.7,1.15+i*(h+gap),2.85,h,st,n>4); }.bind(this));
    PV.text(host,{x:0.45,y:1.15,w:5.9,h:2.0,text:s.para||"",size:12.5,color:TH.INK});
    PV.box(host,{x:0.45,y:3.7,w:5.9,h:1.35,bg:TH.MAROON,radius:true,shadow:true});
    PV.rich(host,{x:0.7,y:3.8,w:5.4,h:1.15,valign:"middle"},[
      {text:(s.band1||"").toUpperCase(),size:12,bold:true,color:TH.GOLD,block:true},
      {text:s.band2||"",size:10,color:"FFFFFF",block:true}]);
  },
  _bandonly:function(s,host,H){ const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,s.sub);
    PV.text(host,{x:0.45,y:1.2,w:9.1,h:2.2,text:s.para||"",size:14,color:TH.INK});
    PV.box(host,{x:0.45,y:3.6,w:9.1,h:1.5,bg:TH.MAROON,radius:true,shadow:true});
    PV.rich(host,{x:0.8,y:3.75,w:8.4,h:1.2,valign:"middle"},[
      {text:(s.band1||"").toUpperCase(),size:15,bold:true,color:TH.GOLD,block:true},
      {text:s.band2||"",size:12,color:"FFFFFF",block:true}]);
  },

  pptx:function(pres,s,d,H){ const TH=H.TH; s.background={color:TH.CREAM}; H.headerBar(pres,s,d.title,d.sub);
    var mode=d.variant||"top";
    var self=this;
    function card(x,y,w,h,st,small){
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:w,h:h,rectRadius:0.08,fill:{color:TH.CARD},line:{color:TH.GOLD,width:0.75},shadow:H.shadow()});
      s.addText([{text:st.v||"",options:{fontSize:H.fitText(st.v,w-0.25,h*0.5,small?13:15,9),bold:true,color:(st.v||"").indexOf("xx")>=0?TH.GRAY:TH.MAROON,breakLine:true}},
                 {text:st.l||"",options:{fontSize:small?7.5:8.5,color:TH.MUTED}}],
        {x:x+0.08,y:y,w:w-0.16,h:h,fontFace:TH.FONT,align:"center",valign:"middle",lineSpacing:14});
    }
    if(mode==="sidebar"){
      var n=(d.stats||[]).length||1, gap=0.15, h=Math.min(1.0,(3.9-gap*(n-1))/n);
      (d.stats||[]).forEach(function(st,i){ card(6.7,1.15+i*(h+gap),2.85,h,st,n>4); });
      s.addText(d.para||"",{x:0.45,y:1.15,w:5.9,h:2.0,fontFace:TH.FONT,fontSize:12.5,color:TH.INK,margin:0});
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.45,y:3.7,w:5.9,h:1.35,rectRadius:0.09,fill:{color:TH.MAROON},shadow:H.shadow()});
      s.addText([{text:(d.band1||"").toUpperCase(),options:{fontSize:12,bold:true,color:TH.GOLD,breakLine:true}},{text:d.band2||"",options:{fontSize:10,color:"FFFFFF"}}],
        {x:0.7,y:3.8,w:5.4,h:1.15,fontFace:TH.FONT,valign:"middle",lineSpacing:15,margin:0});
    } else if(mode==="bandonly"){
      s.addText(d.para||"",{x:0.45,y:1.2,w:9.1,h:2.2,fontFace:TH.FONT,fontSize:14,color:TH.INK,margin:0});
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.45,y:3.6,w:9.1,h:1.5,rectRadius:0.09,fill:{color:TH.MAROON},shadow:H.shadow()});
      s.addText([{text:(d.band1||"").toUpperCase(),options:{fontSize:15,bold:true,color:TH.GOLD,breakLine:true}},{text:d.band2||"",options:{fontSize:12,color:"FFFFFF"}}],
        {x:0.8,y:3.75,w:8.4,h:1.2,fontFace:TH.FONT,valign:"middle",lineSpacing:18,margin:0});
    } else {
      var n2=(d.stats||[]).length||1, gap2=0.2, w2=(9.1-gap2*(n2-1))/n2;
      (d.stats||[]).forEach(function(st,i){ card(0.45+i*(w2+gap2),1.15,w2,1.0,st,n2>4); });
      s.addText(d.para||"",{x:0.45,y:2.45,w:9.1,h:1.0,fontFace:TH.FONT,fontSize:12,color:TH.INK,margin:0});
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.45,y:3.7,w:9.1,h:1.35,rectRadius:0.09,fill:{color:TH.MAROON},shadow:H.shadow()});
      s.addText([{text:(d.band1||"").toUpperCase(),options:{fontSize:13,bold:true,color:TH.GOLD,breakLine:true}},{text:d.band2||"",options:{fontSize:11,color:"FFFFFF"}}],
        {x:0.8,y:3.85,w:8.4,h:1.05,fontFace:TH.FONT,valign:"middle",lineSpacing:17,margin:0});
    }
  }
});
