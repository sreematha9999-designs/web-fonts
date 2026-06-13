/* template-table_chart.js — table on the left, its chart on the right. Adaptive table density. */
OWOF.registerTemplate({
  type:"table_chart", label:"Table + chart",
  defaults:function(){ return {type:"table_chart", title:"Budget vs Spent", sub:"",
    kind:"bar",
    headers:["Project","Value"],
    rows:[{label:"N Block",value:"52"},{label:"Seva Sadan",value:"18"}],
    note:""}; },
  editor:function(s,host,H){
    const fs=H.fieldset("Header");
    const g=document.createElement("div"); g.className="grid3";
    g.appendChild(H.fld("Title",s,"title")); g.appendChild(H.fld("Subtitle (optional)",s,"sub"));
    const kl=document.createElement("div"); const lab=document.createElement("label"); lab.textContent="Chart type"; kl.appendChild(lab);
    const sel=document.createElement("select");
    [["bar","Bar"],["line","Line"],["pie","Pie"],["doughnut","Doughnut"]].forEach(function(o){
      const op=document.createElement("option"); op.value=o[0]; op.textContent=o[1]; if(s.kind===o[0])op.selected=true; sel.appendChild(op);
    });
    sel.onchange=function(){s.kind=sel.value;H.refreshLight();}; kl.appendChild(sel); g.appendChild(kl);
    fs.appendChild(g);
    const g2=document.createElement("div"); g2.className="grid2";
    g2.appendChild(H.fld("Column 1 header (label)",s.headers,"0"));
    g2.appendChild(H.fld("Column 2 header (value)",s.headers,"1"));
    fs.appendChild(g2); host.appendChild(fs);
    const fs2=H.fieldset("Rows — label + numeric value (the chart plots the values)");
    s.rows.forEach(function(row,i){
      const r=document.createElement("div"); r.className="rowline t2";
      const a=document.createElement("input"); a.value=row.label; a.placeholder="Label"; a.oninput=function(){row.label=a.value;H.refreshLight();};
      const b=document.createElement("input"); b.value=row.value; b.placeholder="Value (number)"; b.oninput=function(){row.value=b.value;H.refreshLight();};
      const x=document.createElement("button"); x.className="delrow"; x.textContent="\u2715"; x.onclick=function(){s.rows.splice(i,1);H.refreshAll();};
      r.appendChild(a);r.appendChild(b);r.appendChild(x); fs2.appendChild(r);
    });
    const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add row";
    add.onclick=function(){s.rows.push({label:"",value:""});H.refreshAll();}; fs2.appendChild(add); host.appendChild(fs2);
    const fs3=H.fieldset("Note (optional)"); fs3.appendChild(H.fld("Shown below",s,"note")); host.appendChild(fs3);
  },
  preview:function(s,host,H){
    const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,s.sub);
    // table left
    const reg=PV.box(host,{x:0.45,y:1.3,w:4.3,h:3.6}); reg.style.overflow="hidden";
    const tb=document.createElement("table"); tb.style.width="100%"; tb.style.borderCollapse="collapse"; tb.style.fontSize=PV.fsz(10);
    function td(t,head,o){o=o||{}; const c=document.createElement(head?"th":"td"); c.textContent=t;
      c.style.border="0.12cqw solid #"+TH.GOLD; c.style.padding="0.5cqw 0.7cqw"; c.style.textAlign=o.align||"left";
      c.style.background=head?"#"+TH.MAROON:"#"+TH.CARD; c.style.color=head?"#FFFFFF":"#"+TH.INK; if(head)c.style.fontWeight="700"; return c;}
    const hr=document.createElement("tr"); hr.appendChild(td(s.headers[0]||"",true)); hr.appendChild(td(s.headers[1]||"",true,{align:"right"})); tb.appendChild(hr);
    (s.rows||[]).forEach(function(r){const tr=document.createElement("tr"); tr.appendChild(td(r.label||"")); tr.appendChild(td(r.value||"",false,{align:"right"})); tb.appendChild(tr);});
    reg.appendChild(tb);
    // chart right (reuse simple svg)
    const cw=PV.box(host,{x:5.0,y:1.3,w:4.55,h:3.6});
    var labels=(s.rows||[]).map(function(r){return r.label;}); var vals=(s.rows||[]).map(function(r){return parseFloat(r.value)||0;});
    cw.innerHTML=miniChartSVG(s.kind,labels,vals,TH);
    if(s.note) PV.text(host,{x:0.45,y:5.0,w:9.1,h:0.3,text:s.note,size:10,italic:true,color:TH.MUTED});
    function miniChartSVG(kind,labels,vals,TH){
      var pal=[TH.MAROON,TH.GOLD,TH.GREEN,TH.AMBER,"5B7DB1","8A6FB0"];
      var s='<svg viewBox="0 0 460 360" style="width:100%;height:100%">';
      if(kind==="pie"||kind==="doughnut"){ var tot=vals.reduce(function(a,b){return a+b;},0)||1; var ang=-Math.PI/2,cx=230,cy=170,r=120;
        vals.forEach(function(v,i){var a2=ang+(v/tot)*Math.PI*2;var x1=cx+r*Math.cos(ang),y1=cy+r*Math.sin(ang),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2);var lg=(a2-ang)>Math.PI?1:0;
        s+='<path d="M'+cx+','+cy+' L'+x1+','+y1+' A'+r+','+r+' 0 '+lg+' 1 '+x2+','+y2+' Z" fill="#'+pal[i%pal.length]+'"/>'; ang=a2;});
        if(kind==="doughnut") s+='<circle cx="'+cx+'" cy="'+cy+'" r="62" fill="#'+TH.CREAM+'"/>';
      } else { var mx=Math.max.apply(null,[1].concat(vals)); var gw=400/Math.max(1,vals.length);
        if(kind==="line"){var pts="";vals.forEach(function(v,i){var x=40+i*(380/Math.max(1,vals.length-1));var y=320-(v/mx)*260;pts+=x+","+y+" ";});
          s+='<polyline points="'+pts.trim()+'" fill="none" stroke="#'+pal[0]+'" stroke-width="4"/>';}
        else { vals.forEach(function(v,i){var h=(v/mx)*260;var x=40+i*gw+gw*0.2;var bw=gw*0.6;s+='<rect x="'+x+'" y="'+(320-h)+'" width="'+bw+'" height="'+h+'" fill="#'+pal[i%pal.length]+'"/>';}); }
      }
      return s+'</svg>';
    }
  },
  pptx:function(pres,s,d,H){
    const TH=H.TH; s.background={color:TH.CREAM}; H.headerBar(pres,s,d.title,d.sub);
    var data=[[H.hcell(d.headers[0]||""),H.hcell(d.headers[1]||"",{align:"right"})]];
    (d.rows||[]).forEach(function(r){data.push([H.cell(r.label||""),H.cell(r.value||"",{align:"right"})]);});
    s.addTable(data,{x:0.45,y:1.3,w:4.3,colW:[2.7,1.6],border:H.TB(),margin:0.05,
      rowH:Math.min(0.4, 3.5/Math.max(1,(d.rows||[]).length+1)),autoPage:false});
    var labels=(d.rows||[]).map(function(r){return r.label;}); var vals=(d.rows||[]).map(function(r){return parseFloat(r.value)||0;});
    var pal=[TH.MAROON,TH.GOLD,TH.GREEN,TH.AMBER,"5B7DB1","8A6FB0"];
    var opts={x:5.0,y:1.35,w:4.55,h:3.5,chartColors:pal,showLegend:false,chartArea:{fill:{color:TH.CREAM}},showTitle:false};
    try{
      if(d.kind==="pie"||d.kind==="doughnut"){ opts.showPercent=true;opts.dataLabelColor="FFFFFF";opts.dataLabelFontSize=10; if(d.kind==="doughnut")opts.holeSize=55; opts.showLegend=true;opts.legendPos="b";opts.legendFontSize=8;opts.legendColor=TH.INK;
        s.addChart(d.kind==="doughnut"?pres.charts.DOUGHNUT:pres.charts.PIE,[{name:d.title||"",labels:labels,values:vals}],opts); }
      else if(d.kind==="line"){ s.addChart(pres.charts.LINE,[{name:d.headers[1]||"",labels:labels,values:vals}],opts); }
      else { opts.barDir="col"; s.addChart(pres.charts.BAR,[{name:d.headers[1]||"",labels:labels,values:vals}],opts); }
    }catch(err){ s.addText("Chart error",{x:5.0,y:2.8,w:4.55,h:0.5,align:"center",fontFace:TH.FONT,fontSize:11,color:TH.GRAY}); }
    if(d.note) s.addText(d.note,{x:0.45,y:5.0,w:9.1,h:0.3,fontFace:TH.FONT,fontSize:10,italic:true,color:TH.MUTED,margin:0});
  }
});
