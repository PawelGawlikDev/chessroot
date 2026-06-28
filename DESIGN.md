---
name: Grandmaster Engine
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bccabb'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#869486'
  outline-variant: '#3d4a3e'
  surface-tint: '#4de082'
  primary: '#6bfb9a'
  on-primary: '#003919'
  primary-container: '#4ade80'
  on-primary-container: '#005e2d'
  inverse-primary: '#006d36'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#ffd9c1'
  on-tertiary: '#4f2500'
  tertiary-container: '#ffb47e'
  on-tertiary-container: '#804000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6dfe9c'
  primary-fixed-dim: '#4de082'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005227'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  chess-container-start: '#1e293b'
  chess-container-end: '#0f172a'
  chess-card-bg: '#1e293b'
  chess-card-border: '#334155'
  surface-elevation-1: '#1e293b'
  surface-elevation-2: '#334155'
  win-green: '#22c55e'
  loss-red: '#ef4444'
  draw-gray: '#64748b'
typography:
  display-lg:
    fontFamily: JetBrains Mono
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-mobile: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The design system is engineered for the "data-driven chess player"—individuals who view the game through the lens of logic, engine analysis, and statistical achievement. The brand personality is **technical, authoritative, and rewarding**, transforming the abstract complexity of chess data into a tangible trophy room experience.

The visual style is **Corporate Modern with a Developer-Centric edge**. It prioritizes high-density information display without sacrificing readability. By utilizing deep obsidian surfaces and high-contrast accents, the UI evokes the focused atmosphere of a chess engine interface (like Stockfish or Lichess analysis boards).

**Design Pillars:**

- **Analytical Precision:** Sharp layouts, monospaced typography, and rigid grid structures.
- **Trophy Excellence:** Achievements are treated as high-value assets, using vibrant primary and tertiary colors to highlight success against the dark backdrop.
- **Atmospheric Depth:** The use of "Chess Container" gradients provides a sense of a physical playing surface.

## Colors

The palette is optimized for a **high-contrast dark mode** environment, specifically designed to reduce eye strain during long analysis sessions.

- **Primary (#4ade80):** Used for "Success" states, active trophies, and primary CTAs. This "Chess Green" represents the classic felt of a board and the positive green of an engine advantage.
- **Tertiary (#fb923c):** Reserved for "Rare" achievements, "Insight" highlights, and warning states. It provides a warm counterpoint to the cool green and blue-gray neutrals.
- **Neutral (#0f172a):** A deep navy-slate serves as the foundation. Avoid pure black to maintain soft depth and better contrast with the monospaced text.
- **Surfaces:** Use the `chess-container` gradient for large background areas (Landing, Dashboard) and `chess-card-bg` for individual data modules.

## Typography

This design system uses **JetBrains Mono** exclusively to reinforce the technical nature of chess analysis.

- **Technical Aesthetic:** The monospaced nature ensures that move notation (e.g., `Nxf7+`) and statistics align perfectly in tables and cards.
- **Hierarchy:** Use `label-caps` for category headers (e.g., "PROUD", "PAWN STRUCTURES") to create an institutional, "top-secret" file feel.
- **Numbers:** Numerical data in charts and stat cards should always use the `body-lg` or `headline-md` weights to ensure maximum legibility against dark backgrounds.

## Layout & Spacing

The layout follows a **Fixed Grid** approach for desktop to maintain the density required for data-heavy insights, transitioning to a fluid stack for mobile.

- **Grid:** A 12-column grid is used for the Tools and Achievements pages.
  - **Achievements:** 3-column grid (4 cols each) for Achievement Cards.
  - **Tools:** 2-column grid for Chart.js visuals, 4-column grid for Insight Summary cards.
- **Rhythm:** A base-8 spacing system (8px, 16px, 24px, 32px) ensures alignment between chess-related SVGs and text blocks.
- **Mobile Reflow:** On screens smaller than 768px, all grids collapse to a single column. The `GameFetchPanel` remains pinned or prioritized at the top of the scroll container.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows, maintaining a clean, "digital" aesthetic.

- **Level 0 (Background):** The `chess-container` linear gradient (#1e293b to #0f172a).
- **Level 1 (Cards):** `chess-card-bg` with a 1px solid `chess-card-border`. This "ghost border" approach keeps the UI feeling lightweight.
- **Level 2 (Modals/Overlays):** A slightly lighter slate (#334155) with a subtle 15% opacity primary color shadow (bloom effect) to indicate active focus.
- **Trophy Depth:** Individual trophy SVGs should use a subtle inner glow when "Unlocked" to make them appear inset into the card.

## Shapes

The design system utilizes **Soft (0.25rem)** roundedness.

- **Precision:** The small radius maintains the rigid, technical feel of a chess board and terminal window while avoiding the aggressive sharpness of pure brutalism.
- **Buttons:** Use `rounded-lg` (0.5rem) specifically for buttons to make them more "clickable" and distinct from informational cards.
- **Progress Bars:** The `GameFetchPanel` progress bar should have 0px roundedness on the inner fill to reflect a "loading data" terminal aesthetic.

## Components

### Buttons & Inputs

- **Primary Button:** Solid `primary-color` background with `#0f172a` text. High-contrast, bold weight.
- **Input Fields:** Dark background (#0f172a), 1px `chess-card-border` border. On focus, the border transitions to `primary-color`.

### Achievement Cards (`chess-card-*`)

- **Structure:** Header (Trophy Icon + Title), Body (Description), Footer (Metadata like date/link).
- **Empty State:** Use 20% opacity for trophies not yet earned.
- **Highlight:** When a new achievement is found, the border-color should pulsate using the `primary-color`.

### GameFetchPanel

- **Styling:** Treat as a specialized "Control Center." Use a slightly darker background than standard cards to differentiate the "Input Area" from the "Result Area."
- **Progress:** A thin, high-contrast bar using the `tertiary-color` to indicate active game processing.

### Trophies

- **Icons:** Minimalist, geometric SVG representations of chess pieces or patterns (e.g., a 2x2 grid for "Pawn Cube").
- **Colors:** Category-specific tints are allowed, but the default "Earned" state is `primary-color` (Green) or `tertiary-color` (Orange) for rare feats.

### Charts (Chart.js)

- **Integration:** Charts should use the `neutral` palette for axes and gridlines.
- **Data Series:** Use a sequence of `primary`, `tertiary`, and `secondary` for donut slices to maintain brand consistency.
