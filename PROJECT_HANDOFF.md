# Sneaker Head theme handoff

Last updated: 2026-09-08

## Latest session checkpoint

- Synced recent product media, hover and swatch changes from the local `sneaker-head-theme` checkout into this shared repository. Continue future work in this repository.
- Live deployment target used in this session: `151150559325`, Sneaker Head - Homepage Redesign, at `sneakerheadvn.myshopify.com`.
- Foot Locker footwear card images use `padding: calc(12% + 1.5px) 12%` and `translate: 0 calc(clamp(10px, 5%, 16px) + 8px)`. The latest user-approved change lowered the image another 5px after an earlier 3px shift. PDP and thumbnails keep their separate offset.
- Homepage secondary-image hover uses decoded media and `is-media-hovered`; opacity swaps immediately, secondary zoom is 1.04 over 280ms. Single-image fallback zoom remains 1.04.
- Shared media background is configurable through Product media theme settings. New transparent images use this background.
- User performed visual QA for the latest positioning changes and requested direct targeted pushes without further browser QA.
- A new homepage design is being prepared separately; do not infer that it has already been implemented here.
- This is a source checkpoint, not a fresh full pull of the live theme. Existing repository templates and other unrelated baseline files were retained.

## Project

- Shopify store: `sneakerheadvn.myshopify.com` (formerly `thuandotest`).
- Theme: custom Sneaker Head theme built on Shopify Dawn and Shopify's native theme system.
- Primary source folder: `sneaker-head-homepage-redesign-theme`.
- Currency and storefront product prices: USD.
- Never store Shopify, GitHub, or storefront passwords in this repository.

## How Codex should resume

At the start of every new task:

1. Read this file and `TWO_MACHINE_WORKFLOW.md` completely.
2. Inspect `git status`, the active branch, and recent commits before editing.
3. Confirm whether the requested work is analysis-only or authorizes implementation.
4. Preserve the Shopify theme architecture. Reuse existing sections, snippets, schema settings, and native quick-add behavior.
5. QA source, DOM/CSS/JavaScript, and the real storefront at the required viewports.
6. Do not publish or push a theme live unless the user explicitly authorizes it in the current task.

## Current design direction

- Prototype parity is the baseline for component ratios, typography, spacing, hover states, carousel peeks, and responsive behavior.
- Retain the approved homepage exceptions that are not present in some prototypes:
  - product colorway swatches;
  - secondary-image hover, with a safe zoom fallback when no second image exists;
  - Shopify native quick-add modal;
  - responsive carousel peeks that communicate more content.
- Header and footer use the global Shopify theme-group implementation rather than homepage-only duplicates.
- The homepage includes custom Sneaker Head sections such as hero, hot deals, product rails, brand navigation, campaigns, clothing, accessories, journal, trust and newsletter/footer content.

## Product-card rules currently aligned

- Product media remains a fixed, consistent ratio.
- Only media and product title link to PDP. Quick add must not trigger PDP navigation.
- Hover scope is the media area only.
- On media hover:
  - show the valid secondary image;
  - if no valid secondary image exists, use the approved subtle zoom fallback;
  - show the native quick-add pill without blocking swatches.
- Standard homepage quick-add pill: 38 px high, media width minus 10 px on each side, 999 px radius, Inter 700 at 11 px, 0.08em tracking, 10 px above the media bottom, no border/spin/glow.
- Standard color swatches are compact circles and must remain responsive. Current target size is 24 px unless a later approved design spec replaces it.
- Sale badge appears only when compare-at price is greater than price. It belongs at the media top-right; never render `-0%`.
- Sale price is red. Compare-at price is secondary and struck through.
- Top Deal is an intentional exception:
  - uses a larger inset pill CTA labelled `GRAB THIS DEAL`;
  - keeps its approved animated conic-gradient treatment and glow;
  - can be manually selected in the section settings, with deepest-discount fallback;
  - has no automatic carousel scrolling.

## Important implementation areas

- `sections/sneaker-hero.liquid`
- `sections/sneaker-hot-deals.liquid`
- `sections/sneaker-product-rail.liquid`
- `sections/sneaker-collection-carousel.liquid`
- `sections/sneaker-clothing.liquid`
- `sections/sneaker-brand-navigation.liquid`
- `snippets/card-product.liquid`
- `snippets/sneaker-home-deal-card.liquid`
- `snippets/sneaker-native-quick-add.liquid`
- `snippets/sneaker-card-colorways.liquid`
- `assets/sneaker-home.css`
- `assets/sneaker-home.js`
- `templates/index.json`

Always search the repository for the live selector/component before editing; filenames may evolve.

## Product and colorway data

- Shoe colorways remain separate Shopify products with their own URL, gallery, inventory, SKU, price, and size variants.
- Colorway families are linked through the existing custom-data workflow; do not collapse a family into one Shopify product.
- Future product batches use the approved two-pass import approach: product import first, colorway-link update second.
- Product imagery should be visually consistent and use real, high-quality product assets.

## Current open design topic

The Clothing section may later become `Shop the Look`:

- a 3:4 look banner;
- the banner/look selection controls the associated vertical product rail;
- each look generally contains 4-6 items including top, bottom, shoes, optional accessories, and possibly one bundle card;
- this concept is still being aligned. Do not implement it without explicit approval.

## QA baseline

Check at least:

- mobile: 390 px;
- tablet: 768-1024 px;
- desktop: 1440 px;
- wide desktop: 1920 px.

For every affected component verify:

- visible ratios and crops;
- typeface, font size, weight and line height;
- spacing and alignment;
- hover/focus/selected/disabled states;
- product links, swatches and native quick add;
- carousel count, final reachable item, pagination and responsive peek;
- no nested vertical scrollbar or clipped text.
