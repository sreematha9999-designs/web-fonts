/* a4-cover.js — A4 Cover page.
   Design matches reference: cream top half, logo top-left, large serif title,
   full-bleed photo bottom half, curved maroon wave footer.
   
   FONT SIZE RULE for A4 preview:
   The preview container has container-type:inline-size.
   1cqw = 1% of container WIDTH.
   For a font size of X pt on an 8.268" wide A4 page:
     fontSize = X * 0.1389 + "cqw"   (same constant as landscape fsz() in app.js)
   This is independent of element width — always relative to full page width. */

OWOF.registerA4Template({
  type:"a4-cover", label:"Cover page",
  docTypes:["csr","project-update","fundraising","annual-report","event"],

  defaults:function(){
    return {type:"a4-cover",
      org:"One World One Family Mission",
      title:"Document Title",
      subtitle:"Subtitle or tagline",
      date:"June 2026",
      img:null,
      prepared:"Prepared by: OWOF Construction Team"};
  },

  editor:function(s, host, H){
    var fs = H.fieldset("Cover content");
    fs.appendChild(H.fld("Organisation name", s, "org"));
    fs.appendChild(H.fld("Document title (large)", s, "title"));
    fs.appendChild(H.fld("Subtitle / tagline", s, "subtitle"));
    var g = document.createElement("div"); g.className = "grid2";
    g.appendChild(H.fld("Date", s, "date"));
    g.appendChild(H.fld("Prepared by line", s, "prepared"));
    fs.appendChild(g);
    fs.appendChild(H.imgField("Cover image (hero photo)", s, "img"));
    var hint = document.createElement("p"); hint.className = "hint";
    hint.textContent = "A4 portrait (210 × 297mm). Download A4 button exports this correctly.";
    fs.appendChild(hint);
    host.appendChild(fs);
  },

  preview:function(s, host, H){
    var TH = H.TH;
    var PW = 8.268, PH = 11.693;

    /* fsz: convert pt → cqw for the A4 preview container.
       1cqw = 1% of container width. A4 page = 8.268" wide.
       Scale: 72pt = 1" on print. So X pt ≈ X/72 inches.
       As % of 8.268": X/72/8.268*100 = X*0.1683 — but preview container
       is slightly smaller than full page so empirical factor is 0.138. */
    function fsz(pt){ return (pt * 0.138) + "cqw"; }

    function box(x, y, w, h, bg, extra){
      var d = document.createElement("div");
      d.style.position = "absolute";
      d.style.left   = (x / PW * 100) + "%";
      d.style.top    = (y / PH * 100) + "%";
      d.style.width  = (w / PW * 100) + "%";
      d.style.height = (h / PH * 100) + "%";
      if(bg) d.style.background = "#" + bg;
      if(extra) Object.assign(d.style, extra);
      host.appendChild(d); return d;
    }
    function txt(x, y, w, h, text, opts){
      var o = opts || {};
      var d = box(x, y, w, h, null, {
        display:"flex",
        alignItems:  o.va==="middle"?"center": o.va==="bottom"?"flex-end":"flex-start",
        justifyContent: o.align==="center"?"center": o.align==="right"?"flex-end":"flex-start",
        overflow:"hidden", padding:"0 1.5%",
        fontSize: fsz(o.size || 9),
        fontWeight: o.bold ? "700" : "400",
        fontStyle:  o.italic ? "italic" : "normal",
        color: "#" + (o.color || TH.INK),
        fontFamily: o.serif ? "Cambria,Georgia,serif" : "Arial,sans-serif",
        lineHeight: o.tight ? "1.15" : "1.35",
        whiteSpace: "pre-line", wordBreak: "break-word"
      });
      d.textContent = text || ""; return d;
    }

    host.style.background = "#" + TH.CREAM;

    /* ── Logo top-left (matches reference exactly) ── */
    /* Circle logo mark */
    var logoCircle = box(0.45, 0.35, 0.72, 0.72, null, {
      borderRadius:"50%", border:"2px solid #"+TH.GOLD,
      background:"#"+TH.MAROON,
      display:"flex", alignItems:"center", justifyContent:"center",
      flexShrink:"0"
    });
    logoCircle.style.fontSize = fsz(4);
    logoCircle.style.color = "#fff";
    logoCircle.style.fontWeight = "700";
    logoCircle.style.textAlign = "center";
    logoCircle.style.lineHeight = "1.1";
    logoCircle.textContent = "OWOF";
    /* Org name next to logo */
    txt(1.28, 0.42, 5.0, 0.58, (s.org||"One World One Family Mission").toUpperCase(),
        {bold:true, color:TH.MAROON, size:9, serif:true, va:"middle"});

    /* ── Gold rule under logo band ── */
    box(0.45, 1.22, 7.378, 0.025, TH.GOLD);

    /* ── Large serif title — cream zone ── */
    var titleFsz = (s.title||"").length > 40 ? 22 : (s.title||"").length > 25 ? 26 : 30;
    txt(0.55, 1.55, 7.168, 1.8, s.title || "Document Title",
        {bold:true, color:TH.DMAROON, size:titleFsz, serif:true, tight:true});

    /* ── Subtitle ── */
    txt(0.55, 3.45, 7.168, 0.45, s.subtitle || "",
        {color:TH.INK, size:10.5, italic:false});

    /* ── Date + Prepared ── */
    txt(0.55, 4.05, 3.5, 0.35, s.date || "",
        {color:TH.MUTED, size:9});
    txt(0.55, 4.42, 7.168, 0.35, s.prepared || "",
        {color:TH.MUTED, size:9, italic:true});

    /* ── Hero photo — bottom half ── */
    var imgY = 4.95, imgH = 6.00;
    if(s.img){
      box(0, imgY, PW, imgH, null, {
        backgroundImage:"url('"+(s.img||"")+"')",
        backgroundSize:"cover", backgroundPosition:"center top"
      });
    } else {
      var ph = box(0, imgY, PW, imgH, "E8E0CC", {
        display:"flex", alignItems:"center", justifyContent:"center"
      });
      ph.style.fontSize = fsz(10);
      ph.style.color = "#"+TH.MUTED;
      ph.style.fontStyle = "italic";
      ph.textContent = "COVER IMAGE";
    }

    /* ── Maroon curved footer wave ── */
    /* Approximate the wave with a clipped div + border-radius */
    var wave = box(0, 10.72, PW, 0.97, TH.MAROON, {
      borderRadius:"60% 60% 0 0 / 30% 30% 0 0"
    });
    /* White org name centred in footer */
    txt(0.55, 10.90, 7.168, 0.55,
        (s.org||"One World One Family Mission").toUpperCase(),
        {bold:true, color:"FFFFFF", size:8, align:"center", va:"middle", serif:false});
  },

  a4:function(pres, slide, d, H){
    var TH = H.TH, W = 8.268, M = 0.55, CW = 7.168;
    slide.background = {color: TH.CREAM};

    /* Logo circle */
    slide.addShape(pres.shapes.OVAL, {x:M, y:0.35, w:0.72, h:0.72,
      fill:{color:TH.MAROON}, line:{color:TH.GOLD, width:2}});
    var bl = TH.BRAND.map(function(t,i){ return {text:t, options:{breakLine:i<TH.BRAND.length-1}}; });
    slide.addText(bl, {x:M, y:0.35, w:0.72, h:0.72,
      fontFace:TH.FONT, fontSize:5, bold:true, color:"FFFFFF",
      align:"center", valign:"middle", margin:0});

    /* Org name */
    slide.addText((d.org||"").toUpperCase(), {
      x:1.35, y:0.42, w:5.5, h:0.58,
      fontFace:"Cambria", fontSize:11, bold:true, color:TH.MAROON,
      valign:"middle", margin:0});

    /* Gold rule */
    slide.addShape(pres.shapes.RECTANGLE, {x:M, y:1.22, w:CW, h:0.025,
      fill:{color:TH.GOLD}, line:{color:TH.GOLD, pt:0}});

    /* Large title */
    var titleFsz = (d.title||"").length > 40 ? 26 : (d.title||"").length > 25 ? 30 : 36;
    slide.addText(d.title||"Document Title", {
      x:M, y:1.55, w:CW, h:1.8,
      fontFace:"Cambria", fontSize:titleFsz, bold:true, color:TH.DMAROON,
      valign:"top", margin:0, lineSpacing:titleFsz*1.2});

    /* Subtitle */
    slide.addText(d.subtitle||"", {
      x:M, y:3.45, w:CW, h:0.45,
      fontFace:TH.FONT, fontSize:12, color:TH.INK, margin:0, valign:"middle"});

    /* Date + Prepared */
    slide.addText(d.date||"", {
      x:M, y:4.05, w:3.5, h:0.35,
      fontFace:TH.FONT, fontSize:10, color:TH.MUTED, margin:0});
    slide.addText(d.prepared||"", {
      x:M, y:4.42, w:CW, h:0.35,
      fontFace:TH.FONT, fontSize:10, italic:true, color:TH.MUTED, margin:0});

    /* Hero photo */
    if(d.img){
      H.addImg(pres, slide, d.img, {x:0, y:4.95, w:W, h:6.00,
        sizing:{type:"cover", w:W, h:6.00}});
    } else {
      slide.addShape(pres.shapes.RECTANGLE, {x:0, y:4.95, w:W, h:6.00,
        fill:{color:"E8E0CC"}});
      slide.addText("COVER IMAGE", {x:0, y:4.95, w:W, h:6.00,
        fontFace:TH.FONT, fontSize:14, color:TH.MUTED,
        align:"center", valign:"middle"});
    }

    /* Footer wave — approximated as a rounded rectangle */
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x:0, y:10.82, w:W, h:0.87,
      rectRadius:0.5,
      fill:{color:TH.MAROON}, line:{color:TH.MAROON, pt:0}});
    slide.addText((d.org||"").toUpperCase(), {
      x:M, y:10.82, w:CW, h:0.87,
      fontFace:TH.FONT, fontSize:9, bold:true, color:"FFFFFF",
      align:"center", valign:"middle", charSpacing:1});
  }
});
