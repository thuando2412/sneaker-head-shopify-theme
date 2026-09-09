# Foot Locker catalog source

This folder contains the reproducible source snapshot for the clean Foot Locker catalog batch published on 2026-09-08.

- `product-index.csv`: discovered Foot Locker product URLs.
- `seed-groups.json`: selected product families and colorways.
- `details/`: source product, price, size, inventory and gallery payloads.
- `crawl-progress.json`: successful and failed source fetches.
- `store-before.json`: Shopify product/collection baseline captured before the batch.
- `expansion-seed-groups.json`: curated Women, Kids, Trail and Training families discovered on 2026-09-09.
- `expansion-details/`: current product detail payloads for the expansion batch.
- `expansion-crawl-progress.json`: expansion crawl result.
- `completion-plan.json`, `completion-seed-groups.json`, `completion-details/`: adult lifestyle, women's apparel and girls' assortment completion batch.
- `brand-gap-plan.json`, `brand-gap-seed-groups.json`, `brand-gap-details/`: ASICS, Mizuno and PUMA coverage batch.
- `store-catalog-audit.json`: latest storefront-aware post-cutover audit.

Run the batch builder first:

```powershell
node scripts/build-footlocker-catalog-batch.mjs
```

Review the generated audit and dry run before applying:

```powershell
node scripts/apply-footlocker-catalog-batch.mjs
node scripts/apply-footlocker-catalog-batch.mjs --apply
```

The apply script is idempotent by deterministic product handle. It creates or updates only products in this batch, publishes them to Online Store, creates/updates Colorway Family metaobjects, links product metafields, and verifies Shopify CDN media. It does not archive or delete the old catalog.

Expansion batch commands:

```powershell
node scripts/build-footlocker-catalog-batch.mjs --details data/footlocker/expansion-details --output outputs/footlocker-expansion-batch --batch-tag footlocker-expansion-batch-2026-09
node scripts/apply-footlocker-catalog-batch.mjs --batch outputs/footlocker-expansion-batch --batch-tag footlocker-expansion-batch-2026-09
node scripts/apply-footlocker-catalog-batch.mjs --batch outputs/footlocker-expansion-batch --batch-tag footlocker-expansion-batch-2026-09 --apply
```

Completion and brand-gap batches use the same builder/apply commands with their matching detail and output directories. All batches keep each colorway as a separate product, link only multi-product colorway families, and reject out-of-stock products or galleries with fewer than three valid images.

Audit and cutover:

```powershell
node scripts/audit-footlocker-store.mjs
node scripts/cutover-footlocker-catalog.mjs
node scripts/cutover-footlocker-catalog.mjs --apply
```

The cutover is idempotent. It treats `footlocker-source` as the clean-catalog marker, seeds the four manual merchandising collections, adds a compact Walking edit and archives—never deletes—non-source legacy products.

Credentials are loaded from `.shopify-data.env` or environment variables and must never be committed.
