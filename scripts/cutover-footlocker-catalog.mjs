import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apply = process.argv.includes('--apply');
const output = path.join(root, 'outputs', 'footlocker-catalog-cutover-report.json');
const cleanTag = 'footlocker-source';
const manualHandles = ['frontpage', 'homepage-new-arrivals', 'homepage-top-picks', 'top-picks'];

async function loadEnv() {
  for (const candidate of [path.join(root, '.shopify-data.env'), path.join(root, '..', 'sneaker-head-theme', '.shopify-data.env')]) {
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
const shop = env.SHOPIFY_SHOP.replace(/^https?:\/\//i, '').replace(/\.myshopify\.com.*$/i, '');
const tokenResponse = await fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ client_id: env.SHOPIFY_CLIENT_ID, client_secret: env.SHOPIFY_CLIENT_SECRET, grant_type: 'client_credentials' }),
});
if (!tokenResponse.ok) throw new Error(`Shopify token request failed: ${tokenResponse.status} ${await tokenResponse.text()}`);
const token = (await tokenResponse.json()).access_token;
const endpoint = `https://${shop}.myshopify.com/admin/api/2026-07/graphql.json`;

async function gql(query, variables = {}) {
  const response = await fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json();
  if (!response.ok || result.errors) throw new Error(JSON.stringify(result.errors ?? result, null, 2));
  return result.data;
}

async function loadProducts() {
  const products = [];
  let after = null;
  do {
    const page = await gql(`query CutoverProducts($after: String) {
      products(first: 250, after: $after, sortKey: CREATED_AT, reverse: true) {
        nodes { id handle title status tags productType vendor createdAt totalInventory mediaCount { count } variantsCount { count } }
        pageInfo { hasNextPage endCursor }
      }
    }`, { after });
    products.push(...page.products.nodes);
    after = page.products.pageInfo.hasNextPage ? page.products.pageInfo.endCursor : null;
  } while (after);
  return products;
}

function roundRobin(products, limit) {
  const buckets = new Map();
  for (const product of products) {
    const key = `${product.productType}|${product.vendor}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(product);
  }
  const lists = [...buckets.values()];
  const selected = [];
  for (let index = 0; selected.length < limit && lists.some((list) => list.length); index += 1) {
    for (const list of lists) {
      if (list.length && selected.length < limit) selected.push(list.shift());
    }
  }
  return selected;
}

const setup = await gql(`query CutoverSetup {
  shop { name myshopifyDomain }
  collections(first: 100) {
    nodes { id handle title ruleSet { appliedDisjunctively } products(first: 250) { nodes { id handle } } }
  }
}`);
const products = await loadProducts();
const clean = products.filter((product) => product.tags.includes(cleanTag) && product.status === 'ACTIVE');
const legacy = products.filter((product) => !product.tags.includes(cleanTag) && product.status !== 'ARCHIVED');
const newest = clean.slice(0, 20);
const topPicks = roundRobin(clean, 20);
const walking = roundRobin(clean.filter((product) => /HOKA Clifton|On Cloudmonster|New Balance 530/i.test(product.title)), 16);
const selections = {
  frontpage: topPicks.slice(0, 12),
  'homepage-new-arrivals': newest,
  'homepage-top-picks': topPicks,
  'top-picks': topPicks,
};

const report = {
  generatedAt: new Date().toISOString(), mode: apply ? 'apply' : 'dry-run', shop: setup.shop,
  planned: { cleanProducts: clean.length, archiveLegacy: legacy.length, walkingTags: walking.length, manualCollections: {} },
  applied: { walkingTagged: [], manualCollections: [], archived: [] }, failures: [], verification: null,
};
for (const handle of manualHandles) {
  const collection = setup.collections.nodes.find((item) => item.handle === handle);
  report.planned.manualCollections[handle] = {
    exists: Boolean(collection),
    removeExisting: collection?.products.nodes.length ?? 0,
    addClean: selections[handle].length,
    handles: selections[handle].map((product) => product.handle),
  };
}

if (!apply) {
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

for (const product of walking) {
  try {
    const result = await gql(`mutation AddWalkingTag($id: ID!, $tags: [String!]!) {
      tagsAdd(id: $id, tags: $tags) { node { id } userErrors { field message } }
    }`, { id: product.id, tags: ['walking'] });
    if (result.tagsAdd.userErrors.length) throw new Error(JSON.stringify(result.tagsAdd.userErrors));
    report.applied.walkingTagged.push(product.handle);
  } catch (error) {
    report.failures.push({ stage: 'walking-tag', handle: product.handle, message: error.message });
  }
}

for (const handle of manualHandles) {
  const collection = setup.collections.nodes.find((item) => item.handle === handle && !item.ruleSet);
  if (!collection) {
    report.failures.push({ stage: 'manual-collection', handle, message: 'Manual collection was not found.' });
    continue;
  }
  try {
    if (collection.products.nodes.length) {
      const removed = await gql(`mutation RemoveManualProducts($id: ID!, $productIds: [ID!]!) {
        collectionRemoveProducts(id: $id, productIds: $productIds) { job { id done } userErrors { field message } }
      }`, { id: collection.id, productIds: collection.products.nodes.map((product) => product.id) });
      if (removed.collectionRemoveProducts.userErrors.length) throw new Error(JSON.stringify(removed.collectionRemoveProducts.userErrors));
    }
    const added = await gql(`mutation AddManualProducts($id: ID!, $productIds: [ID!]!) {
      collectionAddProducts(id: $id, productIds: $productIds) { collection { id } userErrors { field message } }
    }`, { id: collection.id, productIds: selections[handle].map((product) => product.id) });
    if (added.collectionAddProducts.userErrors.length) throw new Error(JSON.stringify(added.collectionAddProducts.userErrors));
    report.applied.manualCollections.push({ handle, products: selections[handle].length });
  } catch (error) {
    report.failures.push({ stage: 'manual-collection', handle, message: error.message });
  }
}

for (let index = 0; index < legacy.length; index += 1) {
  const product = legacy[index];
  try {
    const result = await gql(`mutation ArchiveLegacyProduct($product: ProductUpdateInput!) {
      productUpdate(product: $product) { product { id handle status } userErrors { field message } }
    }`, { product: { id: product.id, status: 'ARCHIVED' } });
    if (result.productUpdate.userErrors.length) throw new Error(JSON.stringify(result.productUpdate.userErrors));
    report.applied.archived.push(product.handle);
    if ((index + 1) % 20 === 0 || index + 1 === legacy.length) console.log(`[archive] ${index + 1}/${legacy.length}`);
  } catch (error) {
    report.failures.push({ stage: 'archive', handle: product.handle, message: error.message });
  }
}

const verifiedProducts = await loadProducts();
report.verification = {
  activeClean: verifiedProducts.filter((product) => product.tags.includes(cleanTag) && product.status === 'ACTIVE').length,
  activeLegacy: verifiedProducts.filter((product) => !product.tags.includes(cleanTag) && product.status === 'ACTIVE').length,
  archivedLegacy: verifiedProducts.filter((product) => !product.tags.includes(cleanTag) && product.status === 'ARCHIVED').length,
  cleanQualityFailures: verifiedProducts.filter((product) => product.tags.includes(cleanTag) && (product.totalInventory <= 0 || product.mediaCount.count < 3 || product.variantsCount.count <= 0)).map((product) => product.handle),
};
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ planned: report.planned, applied: { walkingTagged: report.applied.walkingTagged.length, manualCollections: report.applied.manualCollections, archived: report.applied.archived.length }, failures: report.failures, verification: report.verification, output }, null, 2));
