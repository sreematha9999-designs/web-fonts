/* template-photos.js — code chapter: title + optional caption + two photos with gold borders. */
OWOF.registerTemplate({
  type: "photos",
  label: "Photo slide (2 photos)",

  defaults: function(){
    return { type:"photos", title:"Photo Slide", sub:"Project Name · Month 2026",
      caption:"", img1:null, img2:null };
  },

  editor: function(s, host, H){
    const fs = H.fieldset("Header");
    const g = document.createElement("div"); g.className = "grid2";
    g.appendChild(H.fld("Title (e.g. Wing 1)", s, "title"));
    g.appendChild(H.fld("Subtitle line", s, "sub"));
    fs.appendChild(g);
    fs.appendChild(H.fld("Caption (optional italic line)", s, "caption"));
    host.appendChild(fs);

    const fs2 = H.fieldset("Photos (auto-compressed; gold border applied automatically)");
    fs2.appendChild(H.imgField("Photo 1 (left)", s, "img1"));
    fs2.appendChild(H.imgField("Photo 2 (right)", s, "img2"));
    host.appendChild(fs2);
  },

  preview: function(s, host, H){
    const PV = H.pv, TH = H.TH;
    PV.headerBar(host, s.title, s.sub);
    var y = 1.1;
    if(s.caption){
      PV.text(host,{x:0.45,y:1.02,w:9.1,h:0.35,text:s.caption,size:11,italic:true,color:TH.MUTED});
      y = 1.45;
    }
    var h = 5.2 - y;
    [[s.img1,0.45,"Photo 1"],[s.img2,5.1,"Photo 2"]].forEach(function(p){
      if(p[0]){
        var d = PV.img(host,{x:p[1],y:y,w:4.45,h:h,src:p[0]});
        d.style.border = "0.3cqw solid #"+TH.GOLD;
      } else {
        PV.text(host,{x:p[1],y:y,w:4.45,h:h,text:"PHOTO\n"+p[2],size:10,color:TH.MUTED,align:"center",valign:"middle",
          bg:"F2EAD2",line:TH.GOLD,dash:true,radius:true});
      }
    });
  },

  pptx: function(pres, s, d, H){
    const TH = H.TH;
    s.background = {color:TH.CREAM};
    H.headerBar(pres, s, d.title, d.sub);
    var y = 1.1;
    if(d.caption){
      s.addText(d.caption,{x:0.45,y:1.02,w:9.1,h:0.35,fontFace:TH.FONT,fontSize:11,italic:true,color:TH.MUTED,margin:0});
      y = 1.45;
    }
    var h = 5.2 - y;
    [[d.img1,0.45,"Photo 1"],[d.img2,5.1,"Photo 2"]].forEach(function(p){
      if(p[0]){
        H.addImg(pres, s, p[0], {x:p[1],y:y,w:4.45,h:h,sizing:{type:"cover",w:4.45,h:h}});
        s.addShape(pres.shapes.RECTANGLE,{x:p[1],y:y,w:4.45,h:h,fill:{type:"none"},line:{color:TH.GOLD,width:2.25}});
      } else {
        H.placeholderBox(pres, s, p[1], y, 4.45, h, p[2]);
      }
    });
  }
});

/* template-thanks chapter is in template-thanks.js */
