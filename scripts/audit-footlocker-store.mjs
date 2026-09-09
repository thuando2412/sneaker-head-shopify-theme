import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, process.argv[2] || 'data/footlocker/store-catalog-audit.json');

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

const setup = await gql(`query CatalogAuditSetup {
  shop { name myshopifyDomain }
  publications(first: 20) { nodes { id name } }
  collections(first: 100) { nodes { id handle title ruleSet { appliedDisjunctively rules { column relation condition } } } }
}`);
const publication = setup.publications.nodes.find((item) => /online store/i.test(item.name));
if (!publication) throw new Error('Online Store publication was not found.');

const products = [];
let after = null;
do {
  const page = await gql(`query CatalogAuditProducts($after: String, $publicationId: ID!) {
    products(first: 250, after: $after, sortKey: ID) {
      nodes {
        id handle title status tags productType vendor totalInventory
        mediaCount { count } variantsCount { count }
        publishedOnPublication(publicationId: $publicationId)
        collections(first: 50) { nodes { handle } }
      }
      pageInfo { hasNextPage endCursor }
    }
  }`, { after, publicationId: publication.id });
  products.push(...page.products.nodes);
  after = page.products.pageInfo.hasNextPage ? page.products.pageInfo.endCursor : null;
} while (after);

const isClean = (product) => product.tags.includes('footlocker-source');
const clean = products.filter(isClean);
const legacy = products.filter((product) => !isClean(product));
const collectionStats = setup.collections.nodes.map((collection) => {
  const members = products.filter((product) => product.collections.nodes.some((item) => item.handle === collection.handle));
  const storefrontMembers = members.filter((product) => product.status === 'ACTIVE' && product.publishedOnPublication);
  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    kind: collection.ruleSet ? 'automatic' : 'manual',
    adminMembers: members.length,
    products: storefrontMembers.length,
    clean: storefrontMembers.filter(isClean).length,
    legacy: storefrontMembers.filter((product) => !isClean(product)).length,
    cleanHandles: storefrontMembers.filter(isClean).map((product) => product.handle),
  };
}).sort((a, b) => a.handle.localeCompare(b.handle));

const report = {
  generatedAt: new Date().toISOString(),
  shop: setup.shop,
  totals: {
    products: products.length,
    active: products.filter((product) => product.status === 'ACTIVE').length,
    published: products.filter((product) => product.publishedOnPublication).length,
    clean: clean.length,
    cleanActivePublished: clean.filter((product) => product.status === 'ACTIVE' && product.publishedOnPublication).length,
    legacy: legacy.length,
  },
  cleanQuality: {
    zeroInventory: clean.filter((product) => product.totalInventory <= 0).map((product) => product.handle),
    fewerThanThreeMedia: clean.filter((product) => product.mediaCount.count < 3).map((product) => ({ handle: product.handle, media: product.mediaCount.count })),
    zeroVariants: clean.filter((product) => product.variantsCount.count <= 0).map((product) => product.handle),
  },
  collections: collectionStats,
  manualCollections: collectionStats.filter((collection) => collection.kind === 'manual'),
  legacy: legacy.map((product) => ({ id: product.id, handle: product.handle, title: product.title, status: product.status, published: product.publishedOnPublication })),
};

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ totals: report.totals, cleanQuality: report.cleanQuality, manualCollections: report.manualCollections.map(({ handle, products, clean, legacy }) => ({ handle, products, clean, legacy })), output }, null, 2));
