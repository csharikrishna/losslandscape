# Design notes

Kept here so the intent behind the visual decisions survives past the first commit.

## Subject & audience

The page teaches the **loss landscape** — the surface traced by a neural network's
loss function over its parameter space. The audience is technical (ML students,
practitioners) but the goal is *geometric intuition*, not another wall of LaTeX.
The single job of the page: make a reader **feel** the shape of a space they can
never actually see (it has millions of dimensions) by giving them a 3-dimensional
one to fly through.

## Why an immersive dark scene, and not a bright infographic

The reference infographic is bright and diagrammatic — great for a static reference
sheet, but scrolling through six screens of it reads as a slide deck. The brief
asks for a *journey*. A journey through terrain reads naturally as dusk/night flight
— low, indirect light, elevation picked out by a color ramp the way thermal or
bathymetric maps work. That's the justification for the dark base: it's diegetic
(it's what a landscape flyover actually looks like), not a decorative "AI dark mode."

## Token system

**Color** — six named values, one job each:
- `void` `#05070C` — the space around and beneath the terrain. Not pure black:
  it carries a faint blue so the whole scene reads as one lit environment, not a
  UI on top of a black rectangle.
- `void-panel` `#0D1220` — content surfaces (glass panels floating over the terrain).
- `ink` `#EDEFF5` / `ink-dim` `#B4BACC` / `ink-faint` `#7B8299` — a three-step text
  ramp so hierarchy never depends on size alone.
- Elevation ramp `#2E6FF2 → #22B8B0 → #F2C14E → #F2542D` — this **is** the loss
  value. Blue basins, amber ridgelines, vermilion peaks. It is reused everywhere
  loss is discussed (charts, legends, the trajectory dot) so the reader builds one
  consistent color vocabulary for "how bad is this," not a new legend per section.
- `signal` `#8FF7E0` — the one accent that does *not* mean elevation. Reserved for
  UI: annotation call-outs, active states, the trajectory line, links. Kept far
  from the elevation ramp's hues (mint vs. blue/amber/red) so the two vocabularies
  never collide.

**Type** — three roles, three families, on purpose:
- Display: **Space Grotesk** — geometric, slightly architectural, good at large
  sizes for section titles about *shapes* and *geometry*.
- Body: **IBM Plex Sans** — humane and readable at length, with enough technical
  pedigree (IBM's own type system) to sit next to equations without clashing.
- Mono: **IBM Plex Mono** — every coordinate, equation fragment, and axis label
  (`θ ∈ ℝ^d`, `∇L(θ)`) is set in mono, so "this is notation" is signaled by the
  typeface itself, not by italics or a stray dollar sign.

**Signature element** — the trajectory *is* the scrollbar. One continuous glowing
path is laid across the terrain from the hero to the closing section; the dot
marking "you are here" advances along that exact path as the reader scrolls. Scroll
progress and optimizer progress become the same line. Nothing else on the page
carries this much weight, deliberately — everything else (panels, cards, charts)
stays quiet so this one idea reads clearly.

## Restraint choices (what got cut)

- No numbered "01 / 02 / 03" markers — the sections aren't a ranked process, they're
  stops on a route, so they're labeled by terrain feature name instead (already
  meaningful: "Sharp minimum," "Saddle," "Plateau").
- One 3D canvas instance, not one per section — cheaper, and keeps the "single
  continuous world" feeling intact instead of resetting the camera each section.
- No stock icon set. Every glyph on the page is an inline SVG built from the same
  handful of primitives (contour ellipses, arrow field, ridge silhouette) so the
  icon language feels drawn for this page specifically.
