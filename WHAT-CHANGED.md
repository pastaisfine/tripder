# Tripder — pastel restyle: what to replace

Your original app's **flow, routes, state and data are untouched**. This is a
visual re-skin plus four bug fixes. 14 files changed, 2 image files added.

Nothing was added to `package.json` — no new dependencies.

---

## What's in this zip

```
tripder-restyled/       ← the complete working app. Run it as-is.
changed-files-only/     ← ONLY the 15 files that differ. Drop these over your copy.
restyle.patch           ← unified diff, if you prefer `patch -p1`
WHAT-CHANGED.md         ← this file
```

### Option A — just use the finished app

```bash
cd tripder-restyled
npm install
npm run dev
```

### Option B — copy the changed files over your existing project

Copy the contents of `changed-files-only/` into your project root, preserving
paths. It overwrites 13 files and adds 2 images.

### Option C — apply the patch

```bash
cd your-tripder-copy
patch -p1 < restyle.patch
# then copy the two new images manually, since patch skips binaries:
#   public/images/hero-lisbon.jpg
#   public/images/gradient-mesh.jpg
```

---

## The replace list, ranked by how much visual change it buys you

| # | File | Lines changed | What it does |
|---|------|---------------|--------------|
| 1 | `src/index.css` | 124 | **The whole colour scheme.** Design tokens. |
| 2 | `src/App.css` | 557 | Header, tab bar, cards, chips, layout |
| 3 | `src/pages/PlanScreen.jsx` | 76 | Card wrapper class + desktop alignment |
| 4 | `src/pages/SwipeScreen.jsx` | 33 | Crash fix + empty-state layout |
| 5 | `src/pages/SplashScreen.jsx` | 25 | Frosted glass CTA panel, brand fix |
| 6 | `src/components/SatisfactionRing.jsx` | 10 | Coral gradient ring stroke |
| 7 | `src/components/SwipeCard.jsx` | 7 | Frosted overlay chips |
| 8 | `src/pages/DoneScreen.jsx` | 2 | Padding fix (see below) |
| 9 | `src/pages/GroupScreen.jsx` | 2 | Padding fix |
| 10 | `src/pages/HubScreen.jsx` | 2 | Padding fix |
| 11 | `src/pages/SetupScreen.jsx` | 2 | Padding fix |
| 12 | `src/pages/StyleScreen.jsx` | 2 | Padding fix |
| 13 | `src/pages/TravelScreen.jsx` | 2 | Padding fix |
| + | `public/images/hero-lisbon.jpg` | new | Setup screen banner (GPT Image 2) |
| + | `public/images/gradient-mesh.jpg` | new | Style card background (GPT Image 2) |

**If you only replace one file, replace `src/index.css`.** That single file
carries ~80% of the look, because the original CSS was well-tokenized.

---

## 1. `src/index.css` — the tokens that drive everything

The original was a dark sage/pine theme. Replacing the `:root` block is the
single highest-leverage change:

```css
:root {
  --bg:      #FBF7F0;   /* warm cream app canvas */
  --bg-alt:  #F5EDE4;
  --surface: #FFFDFA;
  --fg:      #2E2723;
  --muted:   #8C8078;
  --border:  #EFE4D9;

  --accent:      #EE7F65;   /* coral — the primary signal colour */
  --accent-soft: rgba(238, 127, 101, 0.13);
  --accent-deep: #D2593C;
  --accent-ink:  #B9503A;

  --gerund: #5FB99B;  --nom: #E8705C;  --warn: #E8A87C;
  --lilac:  #C8B6E2;  --sky: #A8CFE8;  --blush: #F4C4C0;  --peach: #FBD9BE;

  --grad-hero: linear-gradient(135deg, #FBD9BE 0%, #F6B9A8 45%, #E7B9DC 100%);
  --grad-soft: linear-gradient(140deg, #FFF1E4 0%, #FDE4E0 55%, #F0E4F6 100%);
  --grad-mint: linear-gradient(135deg, #DFF3EA 0%, #CDEAE0 100%);

  --nav-bg: #FFFDFA;  --nav-ink: #8C8078;

  --r-card: 22px;  --r-control: 15px;  --card-pad: 20px;
  --shadow:      0 16px 38px -20px rgba(150, 112, 96, 0.30);
  --shadow-lift: 0 26px 54px -26px rgba(150, 112, 96, 0.42);
}
```

Also in this file: a new `.btn-coral` button variant, recoloured
`.chip.tag-ok / .tag-split / .tag-off` (mint / peach / lilac), white avatar
text with a double-ring `.avatar.done`, and gradient `.bento-card` variants
(`.accent` `.pink` `.warm` `.mint`).

---

## 2. `src/App.css` — the component-level restyle

The pieces worth knowing about:

**Header and tab bar, dark pine → frosted cream:**

```css
.appheader {
  background: rgba(251, 247, 240, 0.88);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--border);
}
.tabbar {
  background: rgba(255, 253, 250, 0.92);
  backdrop-filter: saturate(180%) blur(18px);
}
.tab.active { color: var(--accent-ink); font-weight: 700; }
.tab.active::before {         /* the soft coral pill behind the active icon */
  content: ''; position: absolute; top: 3px;
  width: 40px; height: 26px;
  border-radius: var(--r-pill); background: var(--accent-soft);
}
```

**Rotating pastel reason chips** — the signature detail from your reference sheet.
Every third chip cycles peach → lilac → mint:

```css
.reason-chip:nth-child(3n+1) { background: rgba(251,217,190,.42); border-color: rgba(232,168,124,.42); }
.reason-chip:nth-child(3n+2) { background: var(--lilac-soft);     border-color: rgba(200,182,226,.5); }
.reason-chip:nth-child(3n+3) { background: var(--gerund-soft);    border-color: rgba(95,185,155,.38); }
.reason-chip.sel { border-color: transparent; background: var(--accent); color: #fff; }
```

**Setup hero** now uses the generated artwork as a rounded card:

```css
.setup-hero {
  height: 168px; border-radius: var(--r-card); overflow: hidden;
  background-image: url('/images/hero-lisbon.jpg');
  background-position: center 72%;
}
```

**Style card** sits on the generated gradient mesh behind an ivory scrim, so
text stays readable:

```css
.stylecard { background-image: url('/images/gradient-mesh.jpg'); background-size: cover; }
.stylecard::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(165deg, rgba(255,253,250,.62) 0%, rgba(255,253,250,.80) 100%);
}
.stylecard > * { position: relative; z-index: 1; }
```

**Group consensus pills** get a colour per card:

```css
.bento-card:nth-of-type(1) .ovpc { background: var(--gerund-soft); color: #3D8E74; }  /* all yes  */
.bento-card:nth-of-type(2) .ovpc { background: var(--warn-soft);   color: #B9754A; }  /* divided  */
.bento-card:nth-of-type(3) .ovpc { background: var(--lilac-soft);  color: #6E5A8C; }  /* one love */
```

---

## Bug fixes included (these are behaviour, not styling)

These were found by automated testing against your original code. They exist
in the original too, so it's worth taking them even if you skip the restyle.

### 1. Crash after the swipe deck was cleared — `SwipeScreen.jsx`

`.sw-actions { display: flex }` in CSS **overrode the HTML `hidden` attribute**,
so the Like/Skip buttons stayed visible and clickable after the last card.
Clicking Like then set `reasonCard` to `undefined`, and saving threw
`Cannot read properties of undefined (reading 'id')`.

Replaced the `hidden` attribute with conditional rendering:

```jsx
{idx < total && (
  <div className="sw-actions">
    ...
  </div>
)}
```

...and added two guards:

```jsx
const handleVerdict = (dir) => {
  const card = CARD_DATA[idx];
  if (!card) return;             // ← added
  swipeCard(dir);
  ...
};

const saveAndClose = () => {
  if (!reasonCard) {             // ← added
    dispatchSheets({ type: "close" });
    return;
  }
  ...
};
```

### 2. "Negotiation notes" was invisible on the Plan screen — `App.css`

`.why-note` is a `<details>` element and a direct flex item of `.screen`
(a flex column). It was being shrunk to **2px tall**, clipping its own 52px
summary row, so the accordion looked like it didn't exist.

One global rule fixes it:

```css
/* screens are flex columns whose content overflows; never let sections
   collapse below their intrinsic height (collapsed <details>, etc.) */
.screen > * { flex-shrink: 0; }
```

### 3. Double-counted top padding — the six 2-line page edits

Each page set an inline `paddingTop: "var(--sb)"` **while its CSS head class
already applied** `calc(var(--sb) + N)`. The header height was counted twice,
leaving a large empty band under the header — very visible on `/plan` and
`/group`.

The fix, in `DoneScreen`, `GroupScreen`, `HubScreen`, `SetupScreen`,
`StyleScreen` and `TravelScreen`:

```jsx
- <section className="screen active" style={{ paddingTop: "var(--sb)" }}>
+ <section className="screen active">
```

### 4. Plan cards stretched to full width on desktop — `PlanScreen.jsx`

The satisfaction / trip-basics / what-if cards carried inline
`maxWidth: "none", width: "auto", flex: "none"` overrides and stretched to
1240px, while the timeline below them capped at 760px — visibly misaligned.

Those inline styles were replaced with a single `.plan-cards` wrapper, and all
plan sections now share one 824px measure at `min-width: 900px`.

Also fixed while in here: content running under the fixed tab bar, and the
cleared-deck card stretching with dead space.

---

## Verification

- Automated 28-step flow test: **28 passed, 0 failed, zero console errors**
- `npx oxlint src` — clean
- `npx vite build` — succeeds (40.5 kB CSS, 405 kB JS)

Covered: destination persistence, date-chip recompute, like/skip reason capture
with distinct copy, tally counting, detail modal, deck clearing, style
computation, all three what-if modes, timeline expand, negotiation notes,
travel picks reaching the plan, survival across a page reload, and all four
tab-bar routes.

---

## One thing I left alone

The travel screen's hotel and flight thumbnails reuse generic Lisbon photos
from your own `src/data/travel.js` — they don't depict the actual properties.
That's original content from your zip, so I didn't touch it.
