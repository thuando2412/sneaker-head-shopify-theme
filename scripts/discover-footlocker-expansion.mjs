import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const output = path.resolve(root, arg('--output', 'data/footlocker/expansion-seed-groups.json'));
const defaultModels = [
  { segment: 'women', category: 'running', url: 'https://www.footlocker.com/product/model/hoka-clifton-10-womens/440649.html' },
  { segment: 'women', category: 'running', url: 'https://www.footlocker.com/product/model/on-cloudmonster-void-womens/440165.html' },
  { segment: 'women', category: 'running', url: 'https://www.footlocker.com/product/model/adidas-adizero-evo-sl-womens/444950.html' },
  { segment: 'women', category: 'running', url: 'https://www.footlocker.com/product/model/nike-air-zoom-pegasus-41-womens/429341.html' },
  { segment: 'kids', category: 'lifestyle', url: 'https://www.footlocker.com/product/model/nike-air-max-270-boys-grade-school/288918.html' },
  { segment: 'kids', category: 'lifestyle', url: 'https://www.footlocker.com/product/model/nike-air-force-1-low-easyon-boys-preschool/424108.html' },
  { segment: 'kids', category: 'basketball', url: 'https://www.footlocker.com/product/model/jordan-air-jordan-1-low-se-boys-grade-school/386685.html' },
  { segment: 'kids', category: 'lifestyle', url: 'https://www.footlocker.com/product/model/adidas-samba-knit-heel-girls-grade-school/477009.html' },
  { segment: 'trail', category: 'trail', url: 'https://www.footlocker.com/product/model/salomon-xt-whisper-womens/475988.html' },
  { segment: 'trail', category: 'trail', url: 'https://www.footlocker.com/product/model/nike-reactx-pegasus-trail-5-gtx-womens/442601.html' },
  { segment: 'trail', category: 'trail', url: 'https://www.footlocker.com/product/model/nike-reactx-pegasus-trail-5-gtx-mens/442519.html' },
  { segment: 'trail', category: 'trail', url: 'https://www.footlocker.com/product/model/hoka-speedgoat-2-mens/283653.html' },
  { segment: 'training', category: 'training', url: 'https://www.footlocker.com/product/model/nike-metcon-10-womens/466492.html' },
  { segment: 'training', category: 'training', url: 'https://www.footlocker.com/product/model/nike-free-metcon-6-mens/433053.html' },
  { segment: 'training', category: 'training', url: 'https://www.footlocker.com/product/model/under-armour-slipspeed-trainer-mens/413702.html' },
  { segment: 'training', category: 'training', url: 'https://www.footlocker.com/product/model/nike-free-metcon-5-womens/402018.html' },
];
const planPath = arg('--plan', '');
const models = planPath
  ? JSON.parse(await fs.readFile(path.resolve(root, planPath), 'utf8')).models
  : defaultModels;

function parseLd(html) {
  const match = html.match(/<script[^>]*id="productLdJson"[^>]*>([\s\S]*?)<\/script>/i);
  return match ? JSON.parse(match[1]) : null;
}

function imageList(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

const groups = [];
const failures = [];
for (let index = 0; index < models.length; index += 1) {
  const model = models[index];
  try {
    const response = await fetch(model.url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if ([403, 429].includes(response.status)) throw new Error(`BLOCKED ${response.status}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const ld = parseLd(html);
    if (!ld?.hasVariant?.length) throw new Error('Product variants were not found');
    const colorways = ld.hasVariant.map((variant) => ({
      availability: String(variant.offers?.availability ?? '').split('/').at(-1),
      color: variant.color || 'Default',
      compare_at_price_usd: variant.offers?.priceSpecification?.price ?? null,
      currency: variant.offers?.priceCurrency ?? 'USD',
      images: imageList(variant.image),
      price_usd: variant.offers?.price ?? null,
      sku: String(variant.sku),
      source_url: variant.offers?.url || `https://www.footlocker.com/product/~/${variant.sku}.html`,
      title: ld.name,
    })).filter((variant) => variant.sku && variant.source_url);
    groups.push({
      brand: ld.brand?.name ?? '',
      category: model.category,
      segment: model.segment,
      colorways,
      description: ld.description ?? '',
      product_group_id: String(ld.productGroupID ?? ''),
      source: 'Foot Locker US',
      source_url: model.url,
      title: ld.name,
    });
    console.log(`[${index + 1}/${models.length}] ${ld.name}: ${colorways.length} colorways`);
  } catch (error) {
    failures.push({ url: model.url, segment: model.segment, category: model.category, error: error.message });
    console.error(`[${index + 1}/${models.length}] failed ${model.url}: ${error.message}`);
    if (error.message.startsWith('BLOCKED')) break;
  }
}

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, JSON.stringify({ generated_at: new Date().toISOString(), groups, failures }, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ groups: groups.length, colorways: groups.reduce((sum, group) => sum + group.colorways.length, 0), failures: failures.length, output }, null, 2));
