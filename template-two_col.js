/* template-two_col.js — code chapter: two columns. Left is always bullets;
   right is either an image or a second bullet column. The proposal workhorse. */
OWOF.registerTemplate({
  type: "two_col",
  label: "Two columns (text | image)",

  defaults: function(){
    return { type:"two_col", title:"Section Title", sub:"",
      leftHead:"Left heading", left:["point","point"],
      rightMode:"image", rightImg:null, rightHead:"Right heading", right:["point","point"] };
  },

  editor: function(s, host, H){
    const fs = H.fieldset("Header");
    const g = document.createElement("div"); g.className = "grid2";
    g.appendChild(H.fld("Title", s, "title"));
    g.appendChild(H.fld("Subtitle (optional)", s, "sub"));
    fs.appendChild(g); host.appendChild(fs);

    const fsL = H.fieldset("Left column (bullets)");
    fsL.appendChild(H.fld("Left heading (optional)", s, "leftHead"));
    listEditor(fsL, s.left, H);
    host.appendChild(fsL);

    const fsR = H.fieldset("Right column");
    const modeLbl = document.createElement("label"); modeLbl.textContent = "Right side shows";
    const mode = document.createElement("select");
    [["image","An image"],["text","A second bullet column"]].forEach(function(o){
      const op = document.createElement("option"); op.value=o[0]; op.textContent=o[1];
      if(s.rightMode===o[0]) op.selected=true; mode.appendChild(op);
    });
    mode.onchange = function(){ s.rightMode = mode.value; H.refreshAll(); };
    fsR.appendChild(modeLbl); fsR.appendChild(mode);
    if(s.rightMode === "image"){
      fsR.appendChild(H.imgField("Right image (upload or images/…path)", s, "rightImg"));
    } else {
      fsR.appendChild(H.fld("Right heading (optional)", s, "rightHead"));
      listEditor(fsR, s.right, H);
    }
    host.appendChild(fsR);

    function listEditor(parent, arr, H){
      arr.forEach(function(v, i){
        const r = document.createElement("div"); r.className = "rowline t2";
        const a = document.createElement("input"); a.value = v; a.placeholder = "Point"; a.style.gridColumn="1 / span 2";
        a.oninput = function(){ arr[i] = a.value; H.refreshLight(); };
        const x = document.createElement("button"); x.className="delrow"; x.textContent="\u2715";
        x.onclick = function(){ arr.splice(i,1); H.refreshAll(); };
        r.appendChild(a); r.appendChild(x); parent.appendChild(r);
      });
      const add = document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add point";
      add.onclick = function(){ arr.push(""); H.refreshAll(); };
      parent.appendChild(add);
    }
  },

  preview: function(s, host, H){
    const PV = H.pv, TH = H.TH;
    PV.headerBar(host, s.title, s.sub);
    colText(PV, host, TH, 0.45, s.leftHead, s.left);
    if(s.rightMode === "image"){
      if(s.rightImg){ var d = PV.img(host,{x:5.1,y:1.2,w:4.45,h:3.9,src:s.rightImg}); d.style.border="0.3cqw solid #"+TH.GOLD; }
      else PV.text(host,{x:5.1,y:1.2,w:4.45,h:3.9,text:"PHOTO\nRight image",size:10,color:TH.MUTED,align:"center",valign:"middle",bg:"F2EAD2",line:TH.GOLD,dash:true,radius:true});
    } else {
      colText(PV, host, TH, 5.1, s.rightHead, s.right);
    }
    function colText(PV, host, TH, x, head, arr){
      var y = 1.2;
      if(head){ PV.text(host,{x:x,y:y,w:4.45,h:0.4,text:head,size:13,bold:true,color:TH.MAROON}); y=1.7; }
      (arr||[]).forEach(function(b,i){
        var yy = y + i*0.5;
        PV.text(host,{x:x,y:yy,w:0.25,h:0.5,text:"\u2022",size:13,bold:true,color:TH.GOLD,valign:"middle"});
        PV.text(host,{x:x+0.32,y:yy,w:4.1,h:0.5,text:b||"",size:11.5,color:TH.INK,valign:"middle"});
      });
    }
  },

  pptx: function(pres, s, d, H){
    const TH = H.TH;
    s.background = {color:TH.CREAM};
    H.headerBar(pres, s, d.title, d.sub);
    col(pres, s, TH, 0.45, d.leftHead, d.left);
    if(d.rightMode === "image"){
      if(d.rightImg){
        H.addImg(pres, s, d.rightImg, {x:5.1,y:1.2,w:4.45,h:3.9,sizing:{type:"cover",w:4.45,h:3.9}});
        s.addShape(pres.shapes.RECTANGLE,{x:5.1,y:1.2,w:4.45,h:3.9,fill:{type:"none"},line:{color:TH.GOLD,width:2.25}});
      } else H.placeholderBox(pres, s, 5.1,1.2,4.45,3.9,"Right image");
    } else {
      col(pres, s, TH, 5.1, d.rightHead, d.right);
    }
    function col(pres, s, TH, x, head, arr){
      var y = 1.2;
      if(head){ s.addText(head,{x:x,y:y,w:4.45,h:0.4,fontFace:TH.FONT,fontSize:13,bold:true,color:TH.MAROON,margin:0}); y=1.7; }
      (arr||[]).forEach(function(b,i){
        var yy = y + i*0.48;
        s.addText("\u2022",{x:x,y:yy,w:0.25,h:0.48,fontFace:TH.FONT,fontSize:13,bold:true,color:TH.GOLD,valign:"middle",margin:0});
        s.addText(b||"",{x:x+0.32,y:yy,w:4.05,h:0.48,fontFace:TH.FONT,fontSize:11.5,color:TH.INK,valign:"middle",margin:0});
      });
    }
  }
});
