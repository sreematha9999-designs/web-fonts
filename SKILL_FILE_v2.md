# OWOF DECK BUILDER — COMPLETE SKILL FILE v2
### Full handoff including design theme, architecture, and all file details
### State: Phase A4-1 complete · June 2026

---

## 0. PERSON, PROJECT & COMMUNICATION STYLE

**Who:** Building a self-hosted browser PPT + A4 document tool for OWOF — One World One Family Mission, founded by Sri Madhusudan Sai.

**Live site:** https://sreematha9999-designs.github.io/web-fonts/

**Communication:** Indian English, casual typed messages with typos — read intent not literal words. Thinks in analogies and big-picture architecture. Confirms understanding before coding. Stays in one chat as long as possible (context matters).

**Core rule — no external APIs, no ongoing costs.** Everything runs offline in the browser from uploaded GitHub files. User pays to build once, not to run forever.

**OWOF projects (for content generation):**
1. SSS Sitaram Jindal Block — 650 Bed Hospital, Phase 2, 20% overall, ~35 staff on GF
2. N Block — RCC structural, Rs.52 Cr budget, Rs.4.18 Cr spent (8%), 1,31,000 sqft
3. Sai Ashraya / Q Block — 111 studio + 14 2-BHK, 55,000 sqft, Rs.xx Cr, payments Nil
4. Sai Sharanam — Nursing Girls' Hostel, G+3, 60% overall, Rs.23.33 Cr remaining
5. Seva Sadan — Staff Residential, G+4, Rs.18 Cr, Rs.6.30 Cr spent (35%)

---

## 1. DESIGN THEME — OWOF BRAND

This is the complete visual identity. Every file reads from `theme-owof.js`. Never hardcode colours in templates.

### Colour palette
```
CREAM:  #FBF5E2   ← page/slide background
CARD:   #FFFDF4   ← card backgrounds, table rows
MAROON: #8B1414   ← primary panels, headers, buttons
DMAROON:#7A0E0E   ← headings, dark maroon (footer bands)
GOLD:   #C9A227   ← accent, borders, table lines, bullets
INK:    #3B3B3B   ← body text
MUTED:  #6E6E6E   ← secondary text, labels
GRAY:   #8F8F8F   ← placeholder values (xx, yy)
GREEN:  #2E7D32   ← status: Completed
AMBER:  #C07600   ← status: In Progress
```

### Typography
```
FONT: "Arial"              ← body, labels, tables
SERIF: "Cambria, Georgia"  ← titles, headings, large text
```

### Logo chip (top-right of every landscape slide)
```
Circle, 0.34" diameter
Fill: MAROON (or WHITE on dark backgrounds)
Border: GOLD 1.5pt
Text inside: "ONE WORLD / ONE FAMILY / MISSION" — 7pt, bold, MAROON (or WHITE)
Position: x:8.52, y:0.26 (landscape) | x:7.25, y:0.15 (A4)
```

### Slide/page anatomy

**Landscape 16:9 (10" × 5.625"):**
```
Header zone:  y=0.22–0.70  ← title (DMAROON, Cambria) + subtitle (INK) + logo chip
Body zone:    y=1.0–5.2    ← content
Safe margin:  0.45" left/right
Gold rule:    0.03–0.04" thick horizontal line (used as section dividers)
```

**A4 Portrait (8.268" × 11.693"):**
```
Top band:     y=0–0.55     ← MAROON fill, white title
Gold rule:    y=0.52–0.55  ← GOLD 0.03" line
Body zone:    y=0.65–11.38 ← content
Footer band:  y=11.38–11.693 ← DMAROON fill
Margin:       0.55" each side
Content width: 7.168"
```

### Card/box styling
```
Background:  CARD (#FFFDF4)
Border:      GOLD 0.75–1pt
Radius:      0.07–0.12" (rounded corners)
Shadow:      outer, #000000, blur 5, offset 2, angle 45, opacity 0.16
```

### Table styling
```
Header row:  MAROON fill, WHITE text, bold, 9.5pt
Body rows:   CARD fill, INK text, 9pt, alternating FAFAF7/FFFFFF
Border:      GOLD 0.75pt all cells
Status badges: GREEN=Completed, AMBER=In Progress, GRAY=Not Started
```

### Photo styling
```
Border: GOLD 2.25pt solid
Shadow: standard card shadow
Sizing: cover (crop to fill, never letterbox)
Placeholder: F2EAD2 fill, GOLD dashed border, MUTED text
```

### Progress bars
```
Track:  #E8E0D0
Fill:   MAROON
Height: 0.055"
```

### Variant thumbnails in Zone 4
One thumbnail per variant, small, with border GOLD when selected.

---

## 2. ARCHITECTURE — LOCKED

### "Design Course" hierarchy (user's mental model)
```
DESIGN COURSE (the whole tool)
├── LANDSCAPE (16:9 PPTX)
│   ├── Subject: OWOF ← built (theme-owof.js)
│   └── Subject: [future] ← new theme file = new subject
└── A4 PORTRAIT (documents)
    ├── Subject: OWOF ← in progress
    └── Subject: [future] ← new theme file
```
**Subjects = theme files. Chapters = template files. One theme serves both formats.**

### File structure (all flat at repo root, no folders)
```
index.html              ← 4-zone UI shell + A4 mode toggle
app.js                  ← engine: registries, helpers, build, UI
theme-owof.js           ← OWOF brand (20 lines)
pptxgen.bundle.min.js   ← PptxGenJS self-hosted (no CDN)
jszip.min.js            ← JSZip dependency self-hosted
template-*.js           ← 23 landscape chapter files
a4-blocks.js            ← A4 block registry + flow detector + layout engine
a4-cover.js             ← A4 cover page chapter
a4-story.js             ← A4 story/impact chapter
```

### The 4-zone UI
- **Zone 1:** Palette — visual thumbnails, draggable. Switches landscape↔A4 via checkbox
- **Zone 2:** Deck lane — filmstrip, drag-drop reorder, duplicate, delete
- **Zone 3:** Editor — Block mode forms + Flow mode free-text, both live simultaneously
- **Zone 4:** Preview (portrait for A4, landscape for slides) + Design variant picker

### Upload pattern (GitHub)
Repo → Add file → Upload files → drag files → Commit → ~2 min redeploy → Ctrl+Shift+R

---

## 3. LANDSCAPE CHAPTER CONTRACT

```javascript
OWOF.registerTemplate({
  type: "typename",
  label: "Human label",
  variants: [{id:"default", label:"Standard"}, {id:"alt", label:"Alt layout"}],
  defaults: function(){ return {type:"typename", variant:"default", ...}; },
  editor:  function(s, host, H){ /* builds form DOM into host */ },
  preview: function(s, host, H){ /* HTML render using H.pv helpers, same coords as pptx */ },
  pptx:    function(pres, slide, s, H){ /* draws real PPT slide, 10×5.625" */ }
});
```

### A4 CHAPTER CONTRACT
```javascript
OWOF.registerA4Template({
  type: "a4-typename",
  label: "Human label",
  docTypes: ["csr","project-update","fundraising","annual-report","event"],
  defaults: function(){ return {type:"a4-typename", ...}; },
  editor:  function(s, host, H){ /* dual-panel: Flow textarea LEFT + Block list RIGHT */ },
  preview: function(s, host, H){ /* portrait preview using % positioning (see §5) */ },
  a4:      function(pres, slide, s, H){ /* draws A4 PPTX, 8.268×11.693" */ }
});
```

---

## 4. SHARED HELPERS (H object — available in every template)

### Theme access
`H.TH` → full theme object (CREAM, CARD, MAROON, DMAROON, GOLD, INK, MUTED, GRAY, GREEN, AMBER, FONT, BRAND[])

### Intelligence
```javascript
H.fitText(text, wIn, hIn, maxPt, minPt)  // auto-size font to fit box
H.autoGrid(n, opts)                        // n items → {cols, rows}
H.overflowRisk(text, wIn, hIn, minPt)     // true if likely overflow
H.warnBox(host, msg)                       // amber warning div in editor
```

### PPT drawing
```javascript
H.shadow()                                 // standard shadow object
H.hcell(text, opts)                        // MAROON table header cell
H.cell(text, opts)                         // CARD table body cell
H.stColor(status)                          // GREEN/AMBER/GRAY by status string
H.TB()                                     // GOLD table border {pt:0.75,color:"C9A227"}
H.logoChip(pres, slide, dark)             // OWOF logo chip, top-right
H.headerBar(pres, slide, title, sub)      // standard slide header (landscape)
H.placeholderBox(pres, slide, x,y,w,h,lbl) // dashed GOLD placeholder
H.addImg(pres, slide, val, opts)          // handles data-URL or repo path string
H.connector(pres, slide, x1,y1,x2,y2, color, wpt) // diagonal line (fixed bounding box)
H.arrowRight(pres, slide, x,y,w,h, color)  // chevron arrow shape
```

### Image helpers
```javascript
H.downscale(file)         // Promise<dataUrl> — compress to ~1600px JPEG
H.imgField(label, obj, key) // dual upload/path input field in editor
```

### Preview kit (H.pv) — landscape 10×5.625" coordinate space
```javascript
H.pv.box(host, {x,y,w,h, bg, line, lineW, dash, radius, shadow, alpha})
H.pv.text(host, {x,y,w,h, text, size, color, bold, italic, align, valign})
H.pv.rich(host, {x,y,w,h,...}, [{text, size, color, bold, italic, block},...])
H.pv.img(host, {x,y,w,h, src})
H.pv.logo(host, dark)
H.pv.headerBar(host, title, sub)
H.pv.fsz(pt)   // pt → cqw units
```

### Refresh
```javascript
H.refreshLight()   // lane + preview (text edits)
H.refreshAll()     // lane + editor + preview (structural changes)
```

---

## 5. A4 PREVIEW SYSTEM

**A4 preview uses a portrait container** (aspect-ratio 595/842).
The container switches automatically: JS sets `host.style.aspectRatio` based on whether the selected slide is in `OWOF.a4Templates`.

**A4 preview positioning** uses percentage-based absolute positioning, NOT the H.pv kit (which uses landscape coordinates). Pattern:

```javascript
preview: function(s, host, H){
  var TH = H.TH;
  // W=8.268", H=11.693" → express positions as % of page
  function box(x, y, w, h, bg, extra){
    var d = document.createElement("div");
    d.style.position = "absolute";
    d.style.left   = (x / 8.268 * 100) + "%";
    d.style.top    = (y / 11.693 * 100) + "%";
    d.style.width  = (w / 8.268 * 100) + "%";
    d.style.height = (h / 11.693 * 100) + "%";
    if(bg) d.style.background = "#" + bg;
    if(extra) Object.assign(d.style, extra);
    host.appendChild(d); return d;
  }
  function txt(x, y, w, h, text, opts){
    var d = box(x,y,w,h, null, {
      display:"flex", overflow:"hidden", padding:"0 1%",
      alignItems: (opts&&opts.va==="middle") ? "center" : (opts&&opts.va==="bottom") ? "flex-end" : "flex-start",
      justifyContent: (opts&&opts.align==="center") ? "center" : "flex-start",
      fontSize: ((opts&&opts.size)||8) * (w/8.268*100/100) + "cqw",
      fontWeight: (opts&&opts.bold) ? "700" : "400",
      fontStyle: (opts&&opts.italic) ? "italic" : "normal",
      color: "#" + ((opts&&opts.color) || TH.INK),
      fontFamily: (opts&&opts.serif) ? "Cambria,Georgia,serif" : "Arial,sans-serif",
      lineHeight:"1.35", whiteSpace:"pre-line", wordBreak:"break-word"
    });
    d.textContent = text || ""; return d;
  }
  // ... draw the page using box() and txt()
}
```

**Key A4 coordinates:**
```
Top band:    box(0, 0, 8.268, 0.55, TH.MAROON)
Gold rule:   box(0, 0.52, 8.268, 0.03, TH.GOLD)
Body start:  y = 0.72
Footer:      box(0, 11.38, 8.268, 0.31, TH.DMAROON)
Side margin: 0.55" (left)
Content W:   7.168"
```

---

## 6. A4 ENGINE (a4-blocks.js)

### Block types (window.A4_BLOCKS)
paragraph, headline, bullet, pullquote, caption, stat, statgroup, table, chart, financial, progressbar, photo, diagram, callout, divider, qr

Each: `{ label, minH, maxH, icon }`

### Flow detector
```javascript
var blocks = A4_detect(textString);
```
Detects from plain text:
- ALL CAPS short line → headline
- Number/Rs standalone → stat (next line = label)
- `"quoted" — Name` → pullquote
- `• / - / *` lines → bullet list
- `item : 60%` → progressbar
- `| col | col |` → table
- `---` or `===` → divider
- Everything else → paragraph

### Layout engine
```javascript
A4_engine.inferPrimary(blocks)          // assigns primary flag
A4_engine.naturalHeight(block, width)   // estimated height in inches
A4_engine.pack(blocks, {x,y,w,h})      // → [{block,x,y,w,h,density}]
A4_engine.splitColumns(blocks)          // → {left[], right[]}
A4_engine.overflows(blocks, zone)       // boolean
```

### Dual-panel editor pattern
```
LEFT: Flow textarea — free text, A4_detect() on input (600ms debounce)
RIGHT: Block list — type selector + content preview + ★primary + ✕delete
BELOW: Photo upload field
Sync: Flow→Blocks (detect), Blocks→Flow (_blocksToFlow)
Both panels always visible, always live, always in sync.
```

---

## 7. JSON DECK FORMAT

```json
{
  "v": 1,
  "theme": "owof",
  "slides": [
    {
      "type": "hero",
      "variant": "hero",
      "num": "01",
      "name": "SSS Sitaram Jindal Block",
      "sub": "650 Bed Hospital · June 2026",
      "img": null
    },
    {
      "type": "a4-cover",
      "org": "One World One Family Mission",
      "title": "CSR Proposal — Sai Sharanam",
      "subtitle": "Building Futures, One Room at a Time",
      "date": "June 2026",
      "img": null,
      "prepared": "Prepared by: OWOF Construction Team"
    },
    {
      "type": "a4-story",
      "sectionTitle": "The Need",
      "blocks": [
        {"type":"headline","content":"TRANSFORMING LIVES","primary":false,"props":{}},
        {"type":"stat","content":"60%","primary":true,"props":{"label":"Overall Progress"}},
        {"type":"paragraph","content":"The Sai Sharanam...","primary":false,"props":{}},
        {"type":"pullquote","content":"Every room built...","primary":false,"props":{"attribution":"OWOF"}},
        {"type":"photo","content":"","primary":false,"props":{"label":"Site photo"}}
      ],
      "footerNote": ""
    }
  ]
}
```

---

## 8. ALL LANDSCAPE TEMPLATES (23)

| Type | Variants | Flexible |
|---|---|---|
| hero | hero / split / classic | — |
| divider | left / center / band | 0–5 stat cards add/remove |
| overview | top / sidebar / bandonly | 2–6 stat cards add/remove |
| table | 1 | add/remove rows |
| fin | 1 | add/remove rows, auto-total |
| photos | 1 | 2 photos |
| content | 1 | add/remove bullets |
| two_col | 1 | — |
| timeline | 1 | 2–6 steps add/remove |
| chart | 1 | bar/barStacked/barGrouped/line/pie/doughnut |
| compare | 1 | 2–3 cols add/remove |
| statement | 1 | auto-sizes text by length |
| quote | 1 | optional photo |
| kpi | cards / strip / twotone | 2–10 add/remove, autoGrid |
| gallery | 1 | 1–10 photos, autoGrid, centered partial rows |
| table_chart | 1 | add/remove rows |
| contact | 1 | 2–4 cards add/remove |
| process | 1 | 2–6 steps add/remove |
| cycle | 1 | 3–7 nodes add/remove |
| hierarchy | 1 | 2–6 children add/remove |
| pyramid | 1 | 2–6 levels add/remove |
| hub | 1 | 3–8 spokes add/remove |
| thanks | 1 | — |

---

## 9. A4 TEMPLATES (built: 2 of ~20)

| Type | Status | Purpose |
|---|---|---|
| a4-cover | ✅ built | Cover page, all doc types |
| a4-story | ✅ built | Story/impact/need page, dual panel |
| a4-data | 🔜 Phase A4-2 | Financial table + chart |
| a4-progress | 🔜 Phase A4-2 | Progress bars + floor breakdown |
| a4-photo-spread | 🔜 Phase A4-2 | Photo grid 1–10 |
| a4-kpi | 🔜 Phase A4-2 | Big numbers page |
| a4-timeline | 🔜 Phase A4-2 | Vertical timeline |
| a4-contact | 🔜 Phase A4-2 | Contact + CTA + back cover |
| a4-text | 🔜 Phase A4-2 | Dense text, CEO letter |
| a4-exec-summary | 🔜 | Stat group + headline + para |
| a4-budget | 🔜 | Fin table + pie + notes |
| a4-split | 🔜 | Problem\|solution two-zone |
| a4-impact | 🔜 | Big stat + story + photo |
| a4-toc | 🔜 | Table of contents |
| a4-section | 🔜 | Section break / chapter opener |
| a4-back-cover | 🔜 | Full MAROON closing page |
| a4-agenda | 🔜 | Schedule table (events) |
| a4-donate | 🔜 | QR code + steps + contact |
| a4-letter | 🔜 | Formal CEO letter layout |
| a4-highlights | 🔜 | Year in numbers (annual report) |

### Document types planned
- CSR Proposal ← build first (Phase A4-2)
- Project Update Report
- Fundraising Campaign
- Annual Report
- Conference/Event Brochure

---

## 10. BUGS FIXED IN LATEST FILES

These are all fixed in the files being handed over:

1. **Preview blank for A4 slides** — `miniPreview`, `renderPreview`, `renderVariants` all now check `OWOF.a4Templates` as well as `OWOF.templates`
2. **Editor shows "not installed"** — `renderEditor` now checks both registries
3. **Type labels wrong** — `typeLabel()` checks both registries
4. **Preview shows landscape for A4** — `renderPreview` sets `host.style.aspectRatio = "595/842"` for A4 slides, `"16/9"` for landscape
5. **A4 preview coordinates wrong** — a4-cover.js and a4-story.js rebuilt with percentage-based positioning
6. **Hub/hierarchy connectors broken** — `H.connector` fixed to use bounding box (positive w/h always)
7. **a4-blocks.js syntax error** — unicode quote chars replaced with safe ASCII

---

## 11. WHAT TO BUILD NEXT

### Phase A4-2 — complete CSR Proposal document type
Build these 7 files (same contract as a4-cover.js and a4-story.js):

**`a4-data.js`** — financial table left, chart right
- `a4()`: fin table with auto-total + bar/pie chart + note line
- `preview()`: table placeholder left, chart placeholder right
- Both Block mode only (structured data)

**`a4-progress.js`** — progress bars + callout stats
- `a4()`: header, stat row, progress bar list (item name + % + filled bar), upcoming work box
- Use same maroon progress bar style as landscape fin slides

**`a4-photo-spread.js`** — photo grid 1–10, auto-arrange
- Reuse `gallery` logic: `_grid(n)` function returns {cols,rows}, centers partial rows
- Both Block mode (explicit photos) and caption field

**`a4-kpi.js`** — big numbers spread
- Full-width grid of KPI cards (same as landscape kpi but A4 proportions)
- `a4()`: header, autoGrid of cards with big value + label

**`a4-timeline.js`** — VERTICAL timeline (key difference from landscape)
- Steps flow top to bottom (not left to right)
- Each step: circle node on a vertical gold line, card to the right

**`a4-contact.js`** — contact + CTA + back cover
- Contact section: 3-column address/phone/email
- CTA section: maroon band with call to action
- Back cover variant: full MAROON page, large title, gold rule, contact line

**`a4-text.js`** — dense text / CEO letter
- Two variants: letter (with date, salutation, signature block) and body text (pure paragraphs)
- Flow mode primary (it's just writing)
- `a4()`: header, clean paragraph text with pull quote support

### After Phase A4-2
- Remaining A4 chapters for Fundraising, Annual Report, Event Brochure
- Landscape variant richness (content, two_col, compare, table, gallery → more variants)
- Speaker notes per slide
- AI Bridge ("Generate brief" button)

---

## 12. HOW TO START THE NEW CHAT

1. Paste this entire document as your first message
2. Say: "Build Phase A4-2 — start with a4-data.js"
3. The new Claude has full context, full theme, full contracts, and can proceed immediately

**Files to upload to GitHub (all 33 — drag them all at once):**
```
index.html              ← shell with A4 mode toggle
app.js                  ← engine (all bugs fixed)
theme-owof.js           ← OWOF brand
pptxgen.bundle.min.js   ← PPT library (self-hosted)
jszip.min.js            ← ZIP library (self-hosted)
template-hero.js        ← 3 variants
template-divider.js     ← 3 variants, flexible cards
template-overview.js    ← 3 variants, flexible cards
template-table.js
template-fin.js
template-photos.js
template-content.js
template-two_col.js
template-timeline.js
template-chart.js
template-compare.js
template-statement.js
template-quote.js
template-kpi.js         ← 3 variants, flexible
template-gallery.js     ← 1-10 photos, autoGrid
template-table_chart.js
template-contact.js
template-process.js
template-cycle.js
template-hierarchy.js
template-pyramid.js
template-hub.js
template-thanks.js
a4-blocks.js            ← A4 engine
a4-cover.js             ← A4 cover (portrait preview fixed)
a4-story.js             ← A4 story (portrait preview fixed, dual panel)
```
