/* template-kpi.js — big-number callouts. Variants: cards / strip / twotone. Flexible 2-10, autoGrid. */
OWOF.registerTemplate({
  type:"kpi", label:"KPI big numbers",
  variants:[{id:"cards",label:"Cards"},{id:"strip",label:"Plain strip"},{id:"twotone",label:"Two-tone"}],
  defaults:function(){ return {type:"kpi", variant:"cards", title:"Key Numbers", sub:"",
    items:[{v:"Rs. 52 Cr",l:"Approved Budget"},{v:"8%",l:"Utilised"},{v:"12 Months",l:"Duration"}]}; },
  editor:function(s,host,H){
    const fs=H.fieldset("Header");
    const g=document.createElement("div"); g.className="grid2";
    g.appendChild(H.fld("Title",s,"title")); g.appendChild(H.fld("Subtitle",s,"sub"));
    fs.appendChild(g); host.appendChild(fs);
    const fs2=H.fieldset("Numbers — add or remove (2 to 10; they auto-arrange)");
    s.items.forEach(function(it,i){
      const r=document.createElement("div"); r.className="rowline t2";
      const a=document.createElement("input"); a.value=it.v; a.placeholder="Value"; a.oninput=function(){it.v=a.value;H.refreshLight();};
      const b=document.createElement("input"); b.value=it.l; b.placeholder="Label"; b.oninput=function(){it.l=b.value;H.refreshLight();};
      const x=document.createElement("button"); x.className="delrow"; x.textContent="\u2715"; x.onclick=function(){s.items.splice(i,1);H.refreshAll();};
      r.appendChild(a);r.appendChild(b);r.appendChild(x); fs2.appendChild(r);
    });
    if(s.items.length<10){ const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add number";
      add.onclick=function(){s.items.push({v:"",l:""});H.refreshAll();}; fs2.appendChild(add); }
    host.appendChild(fs2);
  },
  _grid:function(n){ var p=n<=3?n:n<=4?2:n<=6?3:n<=8?4:5; return {perRow:p,rows:Math.ceil(n/p)}; },
  _layout:function(api,s,H){ const TH=H.TH; var items=s.items||[],n=items.length||1,g=this._grid(n);
    var areaY=1.4,areaH=3.7,gap=0.2, cardH=Math.min(1.6,(areaH-gap*(g.rows-1))/g.rows);
    items.forEach(function(it,i){ var row=Math.floor(i/g.perRow),col=i%g.perRow, inRow=Math.min(g.perRow,n-row*g.perRow);
      var cardW=(9.1-gap*(inRow-1))/inRow, x=0.45+col*(cardW+gap), y=areaY+row*(cardH+gap);
      api.cell(x,y,cardW,cardH,it.v||"",it.l||"",(it.v||"").indexOf("xx")>=0, n>6, i);
    });
  },
  preview:function(s,host,H){ const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,s.sub);
    var mode=s.variant||"cards";
    this._layout({cell:function(x,y,w,h,v,l,ph,small,i){
      if(mode==="cards"){ PV.box(host,{x:x,y:y,w:w,h:h,bg:TH.CARD,line:TH.GOLD,radius:true,shadow:true}); }
      else if(mode==="twotone"){ PV.box(host,{x:x,y:y,w:w,h:h,bg:(i%2===0)?TH.MAROON:TH.CARD,radius:true,shadow:true}); }
      var vc = mode==="twotone"&&(i%2===0) ? TH.GOLD : (ph?TH.GRAY:TH.MAROON);
      var lc = mode==="twotone"&&(i%2===0) ? "FFFFFF" : TH.MUTED;
      PV.rich(host,{x:x+0.1,y:y,w:w-0.2,h:h,align:"center",valign:"middle"},[
        {text:v,size:H.fitText(v,w-0.3,h*0.5,small?18:24,11),bold:true,color:vc,block:true},
        {text:l,size:small?8.5:10,color:lc,block:true}]);
      if(mode==="strip") PV.box(host,{x:x+w*0.3,y:y+h-0.04,w:w*0.4,h:0.03,bg:TH.GOLD});
    }},s,H);
  },
  pptx:function(pres,s,d,H){ const TH=H.TH; s.background={color:TH.CREAM}; H.headerBar(pres,s,d.title,d.sub);
    var mode=d.variant||"cards";
    this._layout({cell:function(x,y,w,h,v,l,ph,small,i){
      if(mode==="cards"){ s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:w,h:h,rectRadius:0.08,fill:{color:TH.CARD},line:{color:TH.GOLD,width:0.75},shadow:H.shadow()}); }
      else if(mode==="twotone"){ s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:w,h:h,rectRadius:0.08,fill:{color:(i%2===0)?TH.MAROON:TH.CARD},shadow:H.shadow()}); }
      var vc = mode==="twotone"&&(i%2===0) ? TH.GOLD : (ph?TH.GRAY:TH.MAROON);
      var lc = mode==="twotone"&&(i%2===0) ? "FFFFFF" : TH.MUTED;
      s.addText([{text:v,options:{fontSize:H.fitText(v,w-0.3,h*0.5,small?18:24,11),bold:true,color:vc,breakLine:true}},
                 {text:l,options:{fontSize:small?8.5:10,color:lc}}],
        {x:x+0.1,y:y,w:w-0.2,h:h,fontFace:TH.FONT,align:"center",valign:"middle",lineSpacing:small?16:20});
      if(mode==="strip") s.addShape(pres.shapes.RECTANGLE,{x:x+w*0.3,y:y+h-0.04,w:w*0.4,h:0.03,fill:{color:TH.GOLD}});
    }},d,H);
  }
});
