---
source: original-b90212e1cd1e815c834849d4ad873081.jpeg
name: this is a travel image-derived design system
surface: mobile travel app
---

# Image-Derived Design System

Soft sage travel UI with ivory cards, dark pine navigation, rounded mobile shells, compact pills, and photo-led itinerary cards.

## Core Tokens

```css
:root {
  --bg: oklch(98.01% 0.0172 113.8);
  --surface: oklch(98.94% 0.0119 101.5);
  --fg: oklch(19.54% 0.0182 137.9);
  --muted: oklch(49.83% 0.0184 154.1);
  --border: oklch(90.54% 0.0172 145.4);
  --accent: oklch(76.19% 0.1405 98.4);
}
```

## Supporting Color Notes

| Token | Source read | Usage |
| --- | --- | --- |
| `--bg` | pale sage mist | app canvas, ambient background |
| `--surface` | warm ivory card | phone screens, sheets, cards |
| `--fg` | near-black pine | headings, active nav, primary pills |
| `--muted` | softened green-gray | metadata, inactive text, icon labels |
| `--border` | quiet sage line | dividers, card outlines, subtle shell edges |
| `--accent` | sun yellow | highlights, saved/star state, weather glyph |

## Typography

- **Display:** Inter, system-ui, -apple-system, Segoe UI, Helvetica Neue, Arial, sans-serif
- **Body:** Inter, system-ui, -apple-system, Segoe UI, Helvetica Neue, Arial, sans-serif
- **Mono:** SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace

## Observed Visual Rules

1. Use large rounded phone surfaces with 28-36px radii, but keep internal cards and controls closer to 8-18px depending on density.
2. Treat photography as the emotional anchor: destination cards use full-bleed natural scenes with readable overlays and compact itinerary metadata.
3. Navigation is dark pine with small filled icons; active states use a small sun-yellow or light-sage signal rather than broad color fills.
4. Controls are capsule-like, dense, and tactile: category chips, floating icon buttons, date pills, and compact weather badges.
5. The layout mixes stacked cards with slight physical overlap and shadow, but text stays inside its image/card bounds and never crosses an edge.

## Component Guidance

- **Buttons:** primary actions are dark pine capsules with ivory text; secondary chips are pale sage/ivory with dark text and a 1px quiet border.
- **Cards:** destination cards use 8-24px radii, soft shadows, and photo masks. Important metadata sits in small pills at the bottom edge.
- **Forms:** search is a vertical or square floating control on mobile, visually secondary to swipe/discovery content.
- **Navigation:** bottom navigation is a single dark rounded bar with five compact destinations; one selected item at a time.

## Imagery

Use crisp real travel photography: forests, alpine valleys, mountain ranges, lakes, and warm golden-hour terrain. Avoid generic illustrated landmarks, heavy filters, and over-saturated vacation stock treatments.
