/* template-gallery.js — 1 to 10 photos, auto-arranged into a grid by count. Gold borders, crop-to-fill. */
OWOF.registerTemplate({
  type:"gallery", label:"Photo gallery (1–10)",
  defaults:function(){ return {type:"gallery", title:"Photos", sub:"", caption:"", imgs:[null,null]}; },
  editor:function(s,host,H){
    const fs=H.fieldset("Header");
    const g=document.createElement("div"); g.className="grid2";
    g.appendChild(H.fld("Title", s, "title")); g.appendChild(H.fld("Subtitle (optional)", s, "sub"));
    fs.appendChild(g); fs.appendChild(H.fld("Caption (optional italic line)", s, "caption")); host.appendChild(fs);
    const fs2=H.fieldset("Photos (1–10; layout adapts to how many)");
    s.imgs.forEach(function(_,i){
      fs2.appendChild(H.imgField("Photo "+(i+1), s.imgs, String(i)));
      const x=document.createElement("button"); x.className="btn ghost mini2"; x.textContent="Remove photo "+(i+1);
      x.style.marginTop="4px"; x.onclick=function(){s.imgs.splice(i,1);H.refreshAll();}; fs2.appendChild(x);
    });
    if(s.imgs.length<10){
      const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add photo";
      add.style.display="block"; add.style.marginTop="8px";
      add.onclick=function(){s.imgs.push(null);H.refreshAll();}; fs2.appendChild(add);
    }
    host.appendChild(fs2);
  },
  _grid:function(n){
    if(n<=1) return {cols:1,rows:1}; if(n===2) return {cols:2,rows:1}; if(n<=3) return {cols:3,rows:1};
    if(n===4) return {cols:2,rows:2}; if(n<=6) return {cols:3,rows:2}; if(n<=8) return {cols:4,rows:2};
    return {cols:5,rows:2};
  },
  _draw:function(api,s,H,isPv){
    const TH=H.TH;
    var imgs=(s.imgs||[]).slice(0,10); var n=imgs.length||1; var g=this._grid(n);
    var y0 = s.caption?1.5:1.15; var areaH=5.2-y0; var gap=0.15;
    var cellW=(9.1-gap*(g.cols-1))/g.cols;
    var cellH=(areaH-gap*(g.rows-1))/g.rows;
    imgs.forEach(function(img,i){
      var r=Math.floor(i/g.cols), c=i%g.cols;
      var inRow=Math.min(g.cols, n-r*g.cols);
      var rowW=(inRow*cellW+(inRow-1)*gap);
      var offX=(9.1-rowW)/2;  /* center last partial row */
      var x=0.45+offX+c*(cellW+gap), y=y0+r*(cellH+gap);
      api.cell(img,x,y,cellW,cellH,"Photo "+(i+1));
    });
  },
  preview:function(s,host,H){
    const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,s.sub);
    if(s.caption) PV.text(host,{x:0.45,y:1.02,w:9.1,h:0.35,text:s.caption,size:11,italic:true,color:TH.MUTED});
    this._draw({cell:function(img,x,y,w,h,lab){
      if(img){ var d=PV.img(host,{x:x,y:y,w:w,h:h,src:img}); d.style.border="0.25cqw solid #"+TH.GOLD; }
      else PV.text(host,{x:x,y:y,w:w,h:h,text:lab,size:9,color:TH.MUTED,align:"center",valign:"middle",bg:"F2EAD2",line:TH.GOLD,dash:true,radius:true});
    }},s,H,true);
  },
  pptx:function(pres,s,d,H){
    const TH=H.TH; s.background={color:TH.CREAM}; H.headerBar(pres,s,d.title,d.sub);
    if(d.caption) s.addText(d.caption,{x:0.45,y:1.02,w:9.1,h:0.35,fontFace:TH.FONT,fontSize:11,italic:true,color:TH.MUTED,margin:0});
    this._draw({cell:function(img,x,y,w,h,lab){
      if(img){ H.addImg(pres,s,img,{x:x,y:y,w:w,h:h,sizing:{type:"cover",w:w,h:h}});
        s.addShape(pres.shapes.RECTANGLE,{x:x,y:y,w:w,h:h,fill:{type:"none"},line:{color:TH.GOLD,width:2}}); }
      else H.placeholderBox(pres,s,x,y,w,h,lab);
    }},d,H,false);
  }
});
