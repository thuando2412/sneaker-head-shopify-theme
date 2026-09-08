# Foot Locker catalog source

This folder contains the reproducible source snapshot for the clean Foot Locker catalog batch published on 2026-09-08.

- `product-index.csv`: discovered Foot Locker product URLs.
- `seed-groups.json`: selected product families and colorways.
- `details/`: source product, price, size, inventory and gallery payloads.
- `crawl-progress.json`: successful and failed source fetches.
- `store-before.json`: Shopify product/collection baseline captured before the batch.

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

Credentials are loaded from `.shopify-data.env` or environment variables and must never be committed.
