/* template-contact.js — closing call-to-action: ways to participate / contact. */
OWOF.registerTemplate({
  type:"contact", label:"Contact / Call to action",
  defaults:function(){ return {type:"contact", title:"Ways to Participate",
    intro:"We invite you to continue your involvement and help expand the impact of this mission.",
    cards:[{h:"Donate",d:"Support service initiatives through strategic donations."},
           {h:"Volunteer",d:"Participate in programs and grassroots outreach."},
           {h:"Connect",d:"Join the community and help amplify our reach."}],
    footer:"One World One Family Foundation"}; },
  editor:function(s,host,H){
    const fs=H.fieldset("Header");
    fs.appendChild(H.fld("Title", s, "title"));
    fs.appendChild(H.fld("Intro line", s, "intro", {area:true, rows:2}));
    host.appendChild(fs);
    const fs2=H.fieldset("Action cards (2–4: heading + description)");
    s.cards.forEach(function(c,i){
      const r=document.createElement("div"); r.className="rowline t2";
      const a=document.createElement("input"); a.value=c.h; a.placeholder="Heading"; a.oninput=function(){c.h=a.value;H.refreshLight();};
      const b=document.createElement("input"); b.value=c.d; b.placeholder="Description"; b.oninput=function(){c.d=b.value;H.refreshLight();};
      const x=document.createElement("button"); x.className="delrow"; x.textContent="\u2715"; x.onclick=function(){s.cards.splice(i,1);H.refreshAll();};
      r.appendChild(a);r.appendChild(b);r.appendChild(x); fs2.appendChild(r);
    });
    if(s.cards.length<4){ const add=document.createElement("button"); add.className="btn ghost addbtn"; add.textContent="+ Add card";
      add.onclick=function(){s.cards.push({h:"",d:""});H.refreshAll();}; fs2.appendChild(add); }
    host.appendChild(fs2);
    const fs3=H.fieldset("Footer band");
    fs3.appendChild(H.fld("Footer line", s, "footer"));
    host.appendChild(fs3);
  },
  preview:function(s,host,H){
    const PV=H.pv,TH=H.TH; PV.headerBar(host,s.title,"");
    if(s.intro) PV.text(host,{x:0.45,y:0.95,w:9.1,h:0.5,text:s.intro,size:11.5,italic:true,color:TH.INK});
    var cards=s.cards||[], n=cards.length||1, gap=0.25, w=(9.1-gap*(n-1))/n;
    cards.forEach(function(c,i){
      var x=0.45+i*(w+gap);
      PV.box(host,{x:x,y:1.7,w:w,h:2.5,bg:TH.CARD,line:TH.GOLD,radius:true,shadow:true});
      PV.text(host,{x:x,y:1.95,w:w,h:0.5,text:c.h||"",size:15,bold:true,color:TH.GOLD,align:"center"});
      PV.text(host,{x:x+0.2,y:2.5,w:w-0.4,h:1.5,text:c.d||"",size:10.5,color:TH.INK,align:"center"});
    });
    PV.box(host,{x:0.45,y:4.5,w:9.1,h:0.7,bg:TH.MAROON,radius:true});
    PV.text(host,{x:0.7,y:4.5,w:8.6,h:0.7,text:s.footer||"",size:13,bold:true,color:"FFFFFF",align:"center",valign:"middle"});
  },
  pptx:function(pres,s,d,H){
    const TH=H.TH; s.background={color:TH.CREAM}; H.headerBar(pres,s,d.title,"");
    if(d.intro) s.addText(d.intro,{x:0.45,y:0.95,w:9.1,h:0.5,fontFace:TH.FONT,fontSize:11.5,italic:true,color:TH.INK,margin:0});
    var cards=d.cards||[], n=cards.length||1, gap=0.25, w=(9.1-gap*(n-1))/n;
    cards.forEach(function(c,i){
      var x=0.45+i*(w+gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x,y:1.7,w:w,h:2.5,rectRadius:0.09,fill:{color:TH.CARD},line:{color:TH.GOLD,width:1},shadow:H.shadow()});
      s.addText(c.h||"",{x:x,y:1.95,w:w,h:0.5,fontFace:TH.FONT,fontSize:15,bold:true,color:TH.GOLD,align:"center",margin:0});
      s.addText(c.d||"",{x:x+0.2,y:2.5,w:w-0.4,h:1.5,fontFace:TH.FONT,fontSize:10.5,color:TH.INK,align:"center",margin:0});
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.45,y:4.5,w:9.1,h:0.7,rectRadius:0.08,fill:{color:TH.MAROON}});
    s.addText(d.footer||"",{x:0.7,y:4.5,w:8.6,h:0.7,fontFace:TH.FONT,fontSize:13,bold:true,color:"FFFFFF",align:"center",valign:"middle",margin:0});
  }
});
