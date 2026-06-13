/* template-kpi.js — row(s) of big-number callouts. Adaptive: count drives grid (2-5 per row). */
OWOF.registerTemplate({
  type:"kpi", label:"KPI big numbers",
  defaults:function(){ return {type:"kpi", title:"Key Numbers", sub:"",
    items:[{v:"Rs. 52 Cr",l:"Approved Budget"},{v:"8%",l:"Utilised"},{v:"12 Months",l:"Duration"}]}; },
  editor:function(s,host,H){
    const fs=H.fieldset("Header");
    const g=document.createElement("div"); g.className="grid2";
    g.appendChild(H.fld("Title", s, "title")); g.appendChild(H.fld("Subtitle (optional)", s, "sub"));
    fs.appendChild(g); host.appendChild(fs);
    const fs2=H.fieldset("Numbers (value + label). 2–10; they auto-arrange into rows.");
    s.items.forEach(function(it,i){
      const r=document.createElement("div"); r.className="rowline t2";
      const a=document.createElement("input"); a.value=it.v; a.placeholder="Big value"; a.oninput=function(){it.v=a.value;H.refreshLight();};
      const b=document.createElement("input"); b.value=it.l; b.placeholder="Label"; b.oninput=function(){it.l=b.value;H.refreshLight();};
      const x=document.createElement("button"); x.className="delrow"; x.textContent="\u2715"; x.onclick=function(){s.items.splice(i,1);H.refreshAll();};
      r.appendChild(a);r.appendChild(b);r.appendChild(x); fs2.appendChild(r);
    });
    const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add number";
    add.onclick=function(){s.items.push({v:"",l:""});H.refreshAll();}; fs2.appendChild(add); host.appendChild(fs2);
  },
  _grid:function(n){ var perRow = n<=3?n : n<=4?2 : n<=6?3 : n<=8?4 : 5; return {perRow:perRow, rows:Math.ceil(n/perRow)}; },
  preview:function(s,host,H){
    const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,s.sub);
    var items=s.items||[], n=items.length||1, g=this._grid(n);
    var areaY=1.4, areaH=3.7, gap=0.2;
    var cardH=Math.min(1.6,(areaH-gap*(g.rows-1))/g.rows);
    items.forEach(function(it,i){
      var row=Math.floor(i/g.perRow), col=i%g.perRow;
      var inRow=Math.min(g.perRow, n-row*g.perRow);
      var cardW=(9.1-gap*(inRow-1))/inRow;
      var x=0.45+col*(cardW+gap), y=areaY+row*(cardH+gap);
      PV.box(host,{x:x,y:y,w:cardW,h:cardH,bg:TH.CARD,line:TH.GOLD,radius:true,shadow:true});
      PV.rich(host,{x:x+0.1,y:y,w:cardW-0.2,h:cardH,align:"center",valign:"middle"},[
        {text:it.v||"",size:n>6?18:24,bold:true,color:(it.v||"").indexOf("xx")>=0?TH.GRAY:TH.MAROON,block:true},
        {text:it.l||"",size:n>6?8.5:10,color:TH.MUTED,block:true}
      ]);
    });
  },
  pptx:function(pres,s,d,H){
    const TH=H.TH; s.background={color:TH.CREAM}; H.headerBar(pres,s,d.title,d.sub);
    var items=d.items||[], n=items.length||1, g=this._grid(n);
    var areaY=1.4, areaH=3.7, gap=0.2;
    var cardH=Math.min(1.6,(areaH-gap*(g.rows-1))/g.rows);
    items.forEach(function(it,i){
      var row=Math.floor(i/g.perRow), col=i%g.perRow;
      var inRow=Math.min(g.perRow, n-row*g.perRow);
      var cardW=(9.1-gap*(inRow-1))/inRow;
      var x=0.45+col*(cardW+gap), y=areaY+row*(cardH+gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:y,w:cardW,h:cardH,rectRadius:0.08,fill:{color:TH.CARD},line:{color:TH.GOLD,width:0.75},shadow:H.shadow()});
      s.addText([
        {text:it.v||"",options:{fontSize:n>6?18:24,bold:true,color:(it.v||"").indexOf("xx")>=0?TH.GRAY:TH.MAROON,breakLine:true}},
        {text:it.l||"",options:{fontSize:n>6?8.5:10,color:TH.MUTED}}
      ],{x:x+0.1,y:y,w:cardW-0.2,h:cardH,fontFace:TH.FONT,align:"center",valign:"middle",lineSpacing:n>6?16:20});
    });
  }
});
