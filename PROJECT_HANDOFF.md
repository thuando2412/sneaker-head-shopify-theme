# Sneaker Head theme handoff

Last updated: 2026-09-14

## Homepage revamp implementation checkpoint — 2026-09-14

- Active implementation branch: `work/machine-b-homepage-revamp`.
- First shipped checkpoint: `f70d406` (`feat: align homepage product rails with shipped design`). Live-QA follow-up: `4f70c3f` (`fix: verify homepage rails on live theme`).
- The user explicitly authorized deploying this homepage work to the live theme for shared testing. Only the affected files were pushed with `--nodelete`; no full-theme upload was performed. Live theme: `151150559325`, `Sneaker Head - Homepage Redesign`.
- Implemented the Handoff 4 rail contract in the Dawn theme: Trending and Accessories render 15 unique colorway families; desktop/tablet/mobile show 5/3/2 product cards; Hot Deals renders `1 Top Deal + 20` regular cards on desktop/tablet and 20 regular cards without Top Deal on mobile.
- All rail tracks use zero-minimum columns/items, a 12 px gap, card-level scroll snap and the approved next-card peek. Vendor/type metadata is one line with ellipsis. The main homepage content caps at 1920 px.
- Live measurements passed: product cards are 210.4 px at 1280, 228 px at 768 and 167 px at 390; Hot Deals compact cards are 173.33 px at 1280, 228 px at 768 and 167 px at 390. No document-level horizontal overflow was detected.
- Desktop product rail pagination reaches `3 / 3`; Hot Deals reaches `2 / 2`; the last item is visible and Next disables at the end. Native Quick Add opens successfully after its section dependencies were made self-contained.
- Source validation passed: JSON parse, JavaScript syntax, `git diff --check`, and Shopify Theme Check with zero errors. Theme Check still reports the 10 pre-existing warnings across 8 unrelated files.
- Important live drift: the live `layout/theme.liquid` differs from the repository version and contains tracking/script-order work that is not committed in Git; its homepage block also omitted the Quick Add assets. The three affected homepage sections now load their own guarded Dawn Quick Add dependencies, so the feature works without overwriting that live layout. Do not run a full-theme push until the live layout changes are reconciled into Git.
- This is the product-rail/Hot Deals foundation checkpoint, not completion of the full homepage revamp. Continue the remaining homepage sections against `HOMEPAGE_REVAMP_AUDIT.md` and Handoff 4, preserving the existing card/colorway/secondary-image behavior.
- Second homepage-body checkpoint: `bc94034` (`feat: ship homepage hero and activity experience`). It was deployed with a targeted live push to theme `151150559325`; the live-only `layout/theme.liquid` was not touched.
- Hero now follows the shipped responsive ratios (mobile 2:3, tablet 16:9, desktop 12:5), responsive typography/CTA sizing and centered desktop composition. Autoplay defaults to 10 seconds with a progress ring; pause preserves elapsed time, play resumes the remainder, arrow/dot/touch interaction stops automatic advancement, and reduced motion disables autoplay.
- Hero dots and Activity audience tabs use production tab semantics and keyboard navigation. Hero arrow states clamp at the ends while autoplay still loops.
- Quick Links now use the canonical 132 px minimum pill, 11 px label, 44 px desktop/tablet height and 40 px mobile height without document overflow.
- Shop by Activity now has Men/Women/Kids feeds, 8 cards per tab, 4-up desktop pages, 56% tablet cards and 88% mobile cards. Cards use 3:4 media, a persistent 44 px touch CTA and desktop-only hover treatment. Women's and Kids' activity links intentionally fall back to the broad `/collections/womens-shoes` and `/collections/kids-shoes` routes until the catalog/collection agent supplies curated activity collections.
- Live browser QA passed at 390, 768, 1280, 1440 and 1920 px: no horizontal overflow or console errors. Hero autoplay/pause/resume/manual-stop/reduced-motion and Activity tab switching all passed. Theme Check remains at zero errors and the same 10 unrelated existing warnings.
- Third homepage-body checkpoint: `d8e278c` (`feat: ship collector and brand homepage sections`). The old New Collections slot is now the approved Collector's Pick and appears before Shop by Brand. It renders all 6 editorial campaigns even while 5 destination collections are pending import, using explicit fallback collection URLs that yield to native collection URLs once available.
- Collector's Pick uses 3 equal 3:4 cards per desktop page, an 82%-width tablet rail and a `calc(100% - 12px)` mobile rail. Desktop pagination reaches `2 / 2`; touch layouts hide rail controls and use the approved bottom View All. Campaign copy is retained in section data but intentionally not rendered because it is absent from Handoff 4.
- Shop by Brand now matches the 8-column/92 px desktop, 4-column/72 px tablet and 124-by-72 px mobile-rail layouts. Targeted live QA passed at 390, 768, 1280 and 1920 px with all 6 campaign cards, all 8 brands, correct section order and no document-level horizontal overflow.

## Latest session checkpoint

- Synced recent product media, hover and swatch changes from the local `sneaker-head-theme` checkout into this shared repository. Continue future work in this repository.
- Live deployment target used in this session: `151150559325`, Sneaker Head - Homepage Redesign, at `sneakerheadvn.myshopify.com`.
- Foot Locker footwear card images use `padding: calc(12% + 1.5px) 12%` and `translate: 0 calc(clamp(10px, 5%, 16px) + 8px)`. The latest user-approved change lowered the image another 5px after an earlier 3px shift. PDP and thumbnails keep their separate offset.
- Homepage secondary-image hover uses decoded media and `is-media-hovered`; opacity swaps immediately, secondary zoom is 1.04 over 280ms. Single-image fallback zoom remains 1.04.
- Shared media background is configurable through Product media theme settings. New transparent images use this background.
- User performed visual QA for the latest positioning changes and requested direct targeted pushes without further browser QA.
- A new homepage design is being prepared separately; do not infer that it has already been implemented here.
- This is a source checkpoint, not a fresh full pull of the live theme. Existing repository templates and other unrelated baseline files were retained.
- Completed the Foot Locker catalog replacement on 2026-09-09. The live storefront now has 129 clean active/published products; the 149 legacy products were archived, not deleted.
- Across all clean batches there are 912 active size variants and 608 Shopify-CDN product images. Every clean product has inventory, at least three media items and at least one variant; all batch apply jobs completed with zero failures.
- Coverage now includes men, women, kids, running, training, trail, lifestyle, clothing, accessories, bags, socks and the ASICS/Mizuno/PUMA brand gaps. Sixteen suitable cushioned products were tagged into Walking.
- Manual collections `frontpage`, `homepage-new-arrivals`, `homepage-top-picks` and `top-picks` were replaced with clean products. Automatic storefront collections contain zero active legacy products.
- Storefront QA passed on homepage, key collections and a new PDP: no broken images; Hot Deals automatically selected a valid new sale product; a legacy PDP returned 404 after archive.
- Shopify CLI/API operations must target the permanent shop domain `thuandotest.myshopify.com`; `sneakerheadvn.myshopify.com` is the current primary public domain and caused an OAuth callback mismatch when used as the CLI store identifier.

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
- Current Foot Locker source snapshot, crawler and batch scripts are in `data/footlocker`, `scripts/crawl-footlocker-catalog.mjs`, `scripts/build-footlocker-catalog-batch.mjs`, and `scripts/apply-footlocker-catalog-batch.mjs`.
- Generated two-pass artifacts and apply verification are in `outputs/footlocker-catalog-batch/`, `outputs/footlocker-expansion-batch/`, `outputs/footlocker-completion-batch/` and `outputs/footlocker-brand-gap-batch/`.
- `scripts/audit-footlocker-store.mjs` produces the current storefront-aware catalog/collection audit. `scripts/cutover-footlocker-catalog.mjs` is the reproducible dry-run/apply cutover that seeds manual collections, tags Walking and archives non-Foot-Locker legacy products.
- The final live cutover evidence is in `outputs/footlocker-catalog-cutover-report.json`; the latest post-cutover audit is `data/footlocker/store-catalog-audit.json`.

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
