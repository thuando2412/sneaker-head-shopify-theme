import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}
const batchDir = path.resolve(root, arg('--batch', 'outputs/footlocker-catalog-batch'));
const batchTag = arg('--batch-tag', 'footlocker-clean-batch-2026-09');
const apply = process.argv.includes('--apply');
const payload = JSON.parse(await fs.readFile(path.join(batchDir, 'product-payload.json'), 'utf8'));
const familyManifest = JSON.parse(await fs.readFile(path.join(batchDir, 'colorway-metaobject-manifest.json'), 'utf8'));
const linkableFamilyHandles = new Set(familyManifest.map((family) => family.handle));

async function loadEnv() {
  const candidates = [
    path.join(root, '.shopify-data.env'),
    path.join(root, '..', 'sneaker-head-theme', '.shopify-data.env'),
  ];
  for (const candidate of candidates) {
    try {
      const text = await fs.readFile(candidate, 'utf8');
      return Object.fromEntries(text.split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return process.env;
}

const env = await loadEnv();
if (!env.SHOPIFY_SHOP || !env.SHOPIFY_CLIENT_ID || !env.SHOPIFY_CLIENT_SECRET) {
  throw new Error('Shopify API credentials are missing. Provide .shopify-data.env or SHOPIFY_SHOP/SHOPIFY_CLIENT_ID/SHOPIFY_CLIENT_SECRET.');
}

const shop = env.SHOPIFY_SHOP.replace(/^https?:\/\//i, '').replace(/\.myshopify\.com.*$/i, '');
const tokenResponse = await fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: env.SHOPIFY_CLIENT_ID,
    client_secret: env.SHOPIFY_CLIENT_SECRET,
    grant_type: 'client_credentials',
  }),
});
if (!tokenResponse.ok) throw new Error(`Shopify token request failed: ${tokenResponse.status} ${await tokenResponse.text()}`);
const token = (await tokenResponse.json()).access_token;
const endpoint = `https://${shop}.myshopify.com/admin/api/2026-07/graphql.json`;

async function gql(query, variables = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json();
  if (!response.ok || result.errors) throw new Error(JSON.stringify(result.errors ?? result, null, 2));
  return result.data;
}

const baseline = await gql(`query FootlockerCatalogBaseline {
  shop { name myshopifyDomain }
  locations(first: 10) { nodes { id name isActive } }
  publications(first: 20) { nodes { id name } }
  metaobjectDefinitionByType(type: "colorway_family") { id }
  metafieldDefinition(identifier: { namespace: "custom", key: "colorway_family", ownerType: PRODUCT }) { id type { name } }
  metaobjects(type: "colorway_family", first: 250) { nodes { id handle displayName } }
}`);

async function loadAllProducts() {
  const products = [];
  let after = null;
  do {
    const page = await gql(`query FootlockerExistingProducts($after: String) {
      products(first: 250, after: $after) {
        nodes { id handle mediaCount { count } }
        pageInfo { hasNextPage endCursor }
      }
    }`, { after });
    products.push(...page.products.nodes);
    after = page.products.pageInfo.hasNextPage ? page.products.pageInfo.endCursor : null;
  } while (after);
  return products;
}

const allExistingProducts = await loadAllProducts();

const location = baseline.locations.nodes.find((item) => item.isActive) ?? baseline.locations.nodes[0];
const publication = baseline.publications.nodes.find((item) => /online store/i.test(item.name));
if (!location || !publication) throw new Error('Active inventory location or Online Store publication is missing.');
if (!baseline.metaobjectDefinitionByType || !baseline.metafieldDefinition) {
  throw new Error('Required Colorway Family metaobject/metafield definitions are missing.');
}

const existingByHandle = new Map(allExistingProducts.map((product) => [product.handle, product]));
const report = {
  generatedAt: new Date().toISOString(),
  mode: apply ? 'apply' : 'dry-run',
  shop: baseline.shop,
  location: { id: location.id, name: location.name },
  publication: { id: publication.id, name: publication.name },
  planned: { products: payload.length, families: familyManifest.length },
  products: [],
  families: [],
  failures: [],
  verification: null,
};

if (!apply) {
  report.products = payload.map((product) => ({
    handle: product.handle,
    title: product.title,
    familyHandle: product.familyHandle,
    variants: product.variants.length,
    images: product.images.length,
    action: existingByHandle.has(product.handle) ? 'update' : 'create',
    willPublish: true,
  }));
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

for (let index = 0; index < payload.length; index += 1) {
  const product = payload[index];
  const existing = existingByHandle.get(product.handle);
  const input = {
    handle: product.handle,
    title: product.title,
    descriptionHtml: product.descriptionHtml,
    vendor: product.vendor,
    productType: product.productType,
    status: 'ACTIVE',
    tags: product.tags,
    seo: { title: product.title, description: `Shop ${product.title} at Sneaker Head.` },
    productOptions: [
      { name: 'Color', position: 1, values: [{ name: product.color }] },
      { name: 'Size', position: 2, values: product.variants.map((variant) => ({ name: variant.size })) },
    ],
    variants: product.variants.map((variant, variantIndex) => ({
      optionValues: [{ optionName: 'Color', name: product.color }, { optionName: 'Size', name: variant.size }],
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      sku: variant.sku,
      barcode: variant.barcode,
      position: variantIndex + 1,
      inventoryPolicy: 'DENY',
      inventoryQuantities: [{ locationId: location.id, name: 'available', quantity: variant.inventoryQuantity }],
      inventoryItem: {
        tracked: true,
        requiresShipping: true,
        measurement: { weight: { value: /Shoes|Sneakers/.test(product.productType) ? 300 : product.productType === 'Backpacks' ? 700 : 250, unit: 'GRAMS' } },
      },
      taxable: true,
    })),
    metafields: [
      ...Object.entries(product.metafields).map(([key, value]) => ({ namespace: 'custom', key, type: 'single_line_text_field', value })),
      { namespace: 'custom', key: 'gender', type: 'single_line_text_field', value: product.gender },
    ],
  };
  if (!existing || existing.mediaCount.count === 0) {
    input.files = product.images.map((originalSource, imageIndex) => ({
      originalSource,
      alt: imageIndex === 0 ? `${product.title} - primary view` : `${product.title} - view ${imageIndex + 1}`,
      contentType: 'IMAGE',
    }));
  }

  try {
    const saved = await gql(`mutation UpsertFootlockerProduct($input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
      productSet(synchronous: true, input: $input, identifier: $identifier) {
        product { id handle title status variantsCount { count } mediaCount { count } }
        userErrors { field message code }
      }
    }`, { input, identifier: existing ? { id: existing.id } : { handle: product.handle } });
    if (saved.productSet.userErrors.length) throw new Error(JSON.stringify(saved.productSet.userErrors));
    const savedProduct = saved.productSet.product;
    const published = await gql(`mutation PublishFootlockerProduct($id: ID!, $publicationId: ID!) {
      publishablePublish(id: $id, input: [{ publicationId: $publicationId }]) { userErrors { field message } }
    }`, { id: savedProduct.id, publicationId: publication.id });
    if (published.publishablePublish.userErrors.length) throw new Error(JSON.stringify(published.publishablePublish.userErrors));
    report.products.push({
      ...savedProduct,
      familyHandle: product.familyHandle,
      expectedImages: product.images.length,
      expectedVariants: product.variants.length,
      familyRequired: linkableFamilyHandles.has(product.familyHandle),
      sourceUrl: product.sourceUrl,
      action: existing ? 'updated' : 'created',
    });
    console.log(`[${index + 1}/${payload.length}] ${existing ? 'updated' : 'created'} ${product.handle}`);
  } catch (error) {
    report.failures.push({ stage: 'product', handle: product.handle, message: error.message });
    console.error(`[${index + 1}/${payload.length}] failed ${product.handle}: ${error.message}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 250));
}

const createdByHandle = new Map(report.products.map((product) => [product.handle, product]));
const existingFamilies = new Map(baseline.metaobjects.nodes.map((family) => [family.handle, family]));

for (const familyPlan of familyManifest) {
  const familyProducts = familyPlan.productHandles.map((handle) => createdByHandle.get(handle)).filter(Boolean);
  if (familyProducts.length < 2) {
    report.failures.push({ stage: 'family', handle: familyPlan.handle, message: 'Fewer than two successfully imported products.' });
    continue;
  }
  const productIds = familyProducts.map((product) => product.id);
  const fields = [
    { key: 'family_name', value: familyPlan.name },
    { key: 'products', value: JSON.stringify(productIds) },
  ];
  try {
    const existingFamily = existingFamilies.get(familyPlan.handle);
    let family;
    if (existingFamily) {
      const updated = await gql(`mutation UpdateFootlockerFamily($id: ID!, $metaobject: MetaobjectUpdateInput!) {
        metaobjectUpdate(id: $id, metaobject: $metaobject) {
          metaobject { id handle displayName }
          userErrors { field message code }
        }
      }`, { id: existingFamily.id, metaobject: { fields, capabilities: { publishable: { status: 'ACTIVE' } } } });
      if (updated.metaobjectUpdate.userErrors.length) throw new Error(JSON.stringify(updated.metaobjectUpdate.userErrors));
      family = updated.metaobjectUpdate.metaobject;
    } else {
      const created = await gql(`mutation CreateFootlockerFamily($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject { id handle displayName }
          userErrors { field message code }
        }
      }`, { metaobject: { type: 'colorway_family', handle: familyPlan.handle, fields, capabilities: { publishable: { status: 'ACTIVE' } } } });
      if (created.metaobjectCreate.userErrors.length) throw new Error(JSON.stringify(created.metaobjectCreate.userErrors));
      family = created.metaobjectCreate.metaobject;
    }

    const linked = await gql(`mutation LinkFootlockerFamily($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id ownerType value }
        userErrors { field message code }
      }
    }`, { metafields: productIds.map((ownerId) => ({
      ownerId,
      namespace: 'custom',
      key: 'colorway_family',
      type: 'list.metaobject_reference',
      value: JSON.stringify([family.id]),
    })) });
    if (linked.metafieldsSet.userErrors.length) throw new Error(JSON.stringify(linked.metafieldsSet.userErrors));
    report.families.push({ ...family, productIds, productHandles: familyPlan.productHandles });
    console.log(`[family] linked ${familyPlan.handle} (${productIds.length})`);
  } catch (error) {
    report.failures.push({ stage: 'family', handle: familyPlan.handle, message: error.message });
    console.error(`[family] failed ${familyPlan.handle}: ${error.message}`);
  }
}

const expectedByHandle = new Map(report.products.map((product) => [product.handle, product]));
let verified = [];
for (let attempt = 0; attempt < 25; attempt += 1) {
  const verification = await gql(`query VerifyFootlockerBatch($query: String!, $publicationId: ID!) {
    products(first: 100, query: $query) {
      nodes {
        id handle status title variantsCount { count } mediaCount { count }
        publishedOnPublication(publicationId: $publicationId)
        media(first: 5) { nodes { ... on MediaImage { status image { url } } } }
        metafield(namespace: "custom", key: "colorway_family") { value }
      }
    }
  }`, { query: `tag:${batchTag}`, publicationId: publication.id });
  verified = verification.products.nodes;
  const allReady = report.products.every((product) => {
    const item = verified.find((candidate) => candidate.handle === product.handle);
    return item
      && item.status === 'ACTIVE'
      && item.publishedOnPublication
      && item.variantsCount.count === product.expectedVariants
      && item.mediaCount.count >= product.expectedImages
      && item.media.nodes.slice(0, product.expectedImages).every((media) => media.status === 'READY' && /cdn\.shopify\.com/i.test(media.image?.url ?? ''))
      && (!product.familyRequired || item.metafield?.value);
  });
  if (allReady) break;
  console.log(`[verify] media/family processing ${attempt + 1}/25`);
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

const productChecks = report.products.map((product) => {
  const item = verified.find((candidate) => candidate.handle === product.handle);
  return {
    handle: product.handle,
    active: item?.status === 'ACTIVE',
    published: Boolean(item?.publishedOnPublication),
    variantsExpected: product.expectedVariants,
    variantsActual: item?.variantsCount.count ?? 0,
    imagesExpected: product.expectedImages,
    imagesActual: item?.mediaCount.count ?? 0,
    readyCdnImages: item?.media.nodes.filter((media) => media.status === 'READY' && /cdn\.shopify\.com/i.test(media.image?.url ?? '')).length ?? 0,
    familyRequired: product.familyRequired,
    familyLinked: Boolean(item?.metafield?.value),
  };
});

report.verification = {
  checkedProducts: productChecks.length,
  passedProducts: productChecks.filter((check) => check.active && check.published
    && check.variantsActual === check.variantsExpected
    && check.imagesActual >= check.imagesExpected
    && check.readyCdnImages >= check.imagesExpected
    && (!check.familyRequired || check.familyLinked)).length,
  checks: productChecks,
};

await fs.writeFile(path.join(batchDir, 'api-apply-report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({
  productsApplied: report.products.length,
  familiesLinked: report.families.length,
  failures: report.failures.length,
  productsPassedVerification: report.verification.passedProducts,
  report: path.join(batchDir, 'api-apply-report.json'),
}, null, 2));

if (report.failures.length || report.verification.passedProducts !== report.products.length) process.exitCode = 2;
