import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}
const detailDir = path.resolve(root, arg('--details', 'data/footlocker/details'));
const outputDir = path.resolve(root, arg('--output', 'outputs/footlocker-catalog-batch'));
const batchTag = arg('--batch-tag', 'footlocker-clean-batch-2026-09');
const minGalleryImages = 3;
const maxGalleryImages = 5;

const csvHeaders = [
  'Title','URL handle','Description','Vendor','Product category','Type','Tags','Published on online store','Status','SKU','Barcode',
  'Option1 name','Option1 value','Option1 Linked To','Option2 name','Option2 value','Option2 Linked To','Option3 name','Option3 value','Option3 Linked To',
  'Price','Compare-at price','Cost per item','Charge tax','Tax code','Inventory tracker','Inventory quantity','Continue selling when out of stock',
  'Weight value (grams)','Weight unit for display','Requires shipping','Fulfillment service','Product image URL','Image position','Image alt text','Variant image URL',
  'Gift card','SEO title','SEO description','Color (product.metafields.shopify.color-pattern)','Gender (product.metafields.custom.gender)',
  'Source SKU (product.metafields.custom.source_sku)','Source URL (product.metafields.custom.source_url)',
];

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[’']/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function csvEscape(value = '') {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows, columns) {
  return [columns.join(','), ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(','))].join('\r\n') + '\r\n';
}

function cleanText(value = '') {
  return String(value)
    .replaceAll('‚Äô', '’')
    .replaceAll('‚Äì', '–')
    .replaceAll('‚Äî', '—')
    .replaceAll('‚Äú', '“')
    .replaceAll('‚Äù', '”')
    .replaceAll('Ã—', '×')
    .replace(/^['"]+|['"]+$/g, '')
    .trim();
}

function cleanSize(value) {
  const text = String(value ?? '').trim();
  const numeric = Number.parseFloat(text);
  if (Number.isFinite(numeric)) return Number.isInteger(numeric) ? String(numeric) : String(numeric);
  return text.replace(/^0+(?=\d)/, '') || 'One Size';
}

function normalizeGender(model) {
  const value = model.genders?.[0] ?? (model.name.match(/- (Men's|Women's|Kids'|Adult)$/)?.[1] ?? 'Unisex');
  return value === 'Adult' ? 'Unisex' : value;
}

function productTypeFor(record) {
  const title = record.groupTitle.toLowerCase();
  if (record.category === 'running') return 'Running Shoes';
  if (record.category === 'trail') return 'Trail Shoes';
  if (record.category === 'training') return 'Training Shoes';
  if (record.category === 'basketball') return 'Basketball Shoes';
  if (record.category === 'lifestyle') return 'Lifestyle Sneakers';
  if (title.includes('hoodie') || title.includes('jacket') || title.includes('windrunner')) return 'Hoodies & Sweatshirts';
  if (title.includes('t-shirt') || title.includes('tee')) return 'T-Shirts';
  if (title.includes('legging')) return 'Leggings';
  if (title.includes('short')) return 'Shorts';
  if (title.includes('pant')) return 'Pants';
  if (title.includes('bra')) return 'Sports Bras';
  if (title.includes('sock')) return 'Run Socks';
  if (title.includes('backpack')) return 'Backpacks';
  return record.category === 'clothing' ? 'Clothing' : 'Accessories';
}

function productCategoryFor(record) {
  if (['running', 'trail', 'training', 'basketball', 'lifestyle'].includes(record.category)) return 'Apparel & Accessories > Shoes';
  if (record.category === 'clothing') {
    const title = record.groupTitle.toLowerCase();
    if (title.includes('legging') || title.includes('pant')) return 'Apparel & Accessories > Clothing > Pants';
    if (title.includes('short')) return 'Apparel & Accessories > Clothing > Shorts';
    if (title.includes('hoodie')) return 'Apparel & Accessories > Clothing > Activewear';
    if (title.includes('t-shirt') || title.includes('tee')) return 'Apparel & Accessories > Clothing > Shirts & Tops';
    return 'Apparel & Accessories > Clothing';
  }
  return 'Apparel & Accessories > Handbags, Wallets & Cases > Backpacks';
}

function vendorFor(value) {
  if (/^on$/i.test(value)) return 'On Running';
  if (/^asics/i.test(value)) return 'ASICS';
  if (/^adidas$/i.test(value)) return 'adidas';
  return value;
}

function familyNameFor(record) {
  return cleanText(record.groupTitle).replace(/\s+-\s+(Men's|Women's|Kids'|Adult)$/i, ' $1');
}

function familyHandleFor(record) {
  return slugify(familyNameFor(record))
    .replace(/-mens$/, '-men')
    .replace(/-womens$/, '-women')
    .replace(/-kids$/, '-kids');
}

function titleFor(record, type, color) {
  let base = familyNameFor(record);
  const suffixByType = {
    'Running Shoes': 'Running Shoes',
    'Trail Shoes': 'Trail Shoes',
    'Training Shoes': 'Training Shoes',
    'Basketball Shoes': 'Basketball Shoes',
    'Lifestyle Sneakers': 'Sneakers',
  };
  if (suffixByType[type] && !/shoes?|sneakers?\b/i.test(base)) base += ` ${suffixByType[type]}`;
  return `${base} - ${color}`;
}

function selectedLdVariant(record) {
  const variants = Array.isArray(record.ld?.hasVariant) ? record.ld.hasVariant : [];
  return variants.find((variant) => String(variant.sku).toLowerCase() === String(record.data.style.sku).toLowerCase());
}

function galleryImages(record) {
  const raw = selectedLdVariant(record)?.image;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const normalized = list.map((source) => {
    const asset = String(source).split('/').at(-1).split('?')[0];
    return `https://assets.footlocker.com/is/image/FLDM/${asset}?wid=1600&hei=1600&fmt=png-alpha`;
  });
  return [...new Set(normalized)].slice(0, maxGalleryImages);
}

function tagsFor(record, productType, vendor, compareAtPrice, price) {
  const tags = [batchTag, 'footlocker-source', 'new-arrivals', slugify(vendor), `style:${record.data.style.sku}`];
  const gender = normalizeGender(record.data.model).toLowerCase();
  if (/^men\b|men's/.test(gender) && !/women/.test(gender)) tags.push('men');
  if (/^women\b|women's/.test(gender)) tags.push('women');
  if (record.segment === 'kids' || /kid|boy|girl|preschool|grade school|toddler/.test(gender)) tags.push('kids');
  if (record.category === 'running') tags.push('Running', 'running');
  if (record.category === 'trail') tags.push('trail', 'Running');
  if (record.category === 'training') tags.push('training');
  if (record.category === 'basketball') tags.push('basketball');
  if (record.category === 'lifestyle') tags.push('everyday');
  if (record.category === 'clothing') tags.push('clothing');
  if (record.category === 'accessories') tags.push('accessories');
  if (productType === 'Backpacks') tags.push('bags-packs');
  if (productType === 'Run Socks') tags.push('run-socks');
  if (compareAtPrice > price) tags.push('sale');
  return [...new Set(tags)];
}

await fs.mkdir(outputDir, { recursive: true });
const detailFiles = (await fs.readdir(detailDir)).filter((file) => file.endsWith('.json')).sort();
const products = [];
const excluded = [];

for (const file of detailFiles) {
  const record = JSON.parse(await fs.readFile(path.join(detailDir, file), 'utf8'));
  const style = record.data?.style;
  const model = record.data?.model;
  if (!style || !model) {
    excluded.push({ sku: path.basename(file, '.json'), reason: 'missing product data' });
    continue;
  }

  const variants = (record.data.sizes ?? [])
    .filter((size) => size.active && size.inventory?.inventoryAvailable && size.upc)
    .map((size) => ({
      size: cleanSize(size.size),
      sku: `${style.sku}-${cleanSize(size.size).replaceAll('.', '-')}`,
      barcode: size.upc,
      price: Number(size.price?.salePrice ?? style.price.salePrice).toFixed(2),
      compareAtPrice: Number(size.price?.listPrice ?? style.price.listPrice) > Number(size.price?.salePrice ?? style.price.salePrice)
        ? Number(size.price?.listPrice ?? style.price.listPrice).toFixed(2)
        : null,
      inventoryQuantity: 8,
    }));
  const uniqueVariants = [...new Map(variants.map((variant) => [variant.size, variant])).values()];
  const images = galleryImages(record);
  if (!uniqueVariants.length) {
    excluded.push({ sku: style.sku, family: record.groupTitle, color: style.color, reason: 'no in-stock size' });
    continue;
  }
  if (images.length < minGalleryImages) {
    excluded.push({ sku: style.sku, family: record.groupTitle, color: style.color, reason: `gallery has ${images.length} image(s)` });
    continue;
  }

  const productType = productTypeFor(record);
  const productCategory = productCategoryFor(record);
  const vendor = vendorFor(record.brand || model.brand);
  const familyName = familyNameFor(record);
  const familyHandle = familyHandleFor(record);
  const color = cleanText(style.color || 'Default');
  const title = titleFor(record, productType, color);
  const handle = `${familyHandle}-${slugify(color)}-${String(style.sku).toLowerCase()}`;
  const price = Number(style.price.salePrice).toFixed(2);
  const compareAtPrice = Number(style.price.listPrice) > Number(style.price.salePrice) ? Number(style.price.listPrice).toFixed(2) : null;
  const tags = tagsFor(record, productType, vendor, Number(compareAtPrice ?? 0), Number(price));
  const descriptionHtml = cleanText(model.description) || `<p>${title}</p>`;
  const gender = normalizeGender(model);

  products.push({
    sku: style.sku,
    color,
    primaryColor: style.primaryColor || color.split('/')[0],
    handle,
    familyHandle,
    familyName,
    title,
    vendor,
    productType,
    productCategory,
    sourceUrl: record.sourceUrl,
    descriptionHtml,
    tags,
    price,
    compareAtPrice,
    variants: uniqueVariants,
    images,
    metafields: { source_sku: style.sku, source_url: record.sourceUrl },
    gender,
  });
}

products.sort((a, b) => a.familyHandle.localeCompare(b.familyHandle) || a.handle.localeCompare(b.handle));
const families = [...new Map(products.map((product) => [product.familyHandle, {
  handle: product.familyHandle,
  name: product.familyName,
  productHandles: products.filter((candidate) => candidate.familyHandle === product.familyHandle).map((candidate) => candidate.handle),
}])).values()];
const linkableFamilies = families.filter((family) => family.productHandles.length >= 2);
const linkableFamilyHandles = new Set(linkableFamilies.map((family) => family.handle));

const productRows = [];
for (const product of products) {
  product.variants.forEach((variant, index) => productRows.push({
    'Title': index === 0 ? product.title : '',
    'URL handle': product.handle,
    'Description': index === 0 ? product.descriptionHtml : '',
    'Vendor': index === 0 ? product.vendor : '',
    'Product category': index === 0 ? product.productCategory : '',
    'Type': index === 0 ? product.productType : '',
    'Tags': index === 0 ? product.tags.join(', ') : '',
    'Published on online store': index === 0 ? 'TRUE' : '',
    'Status': index === 0 ? 'Active' : '',
    'SKU': variant.sku,
    'Barcode': variant.barcode,
    'Option1 name': 'Color',
    'Option1 value': product.color,
    'Option2 name': 'Size',
    'Option2 value': variant.size,
    'Price': variant.price,
    'Compare-at price': variant.compareAtPrice ?? '',
    'Charge tax': 'TRUE',
    'Inventory tracker': 'shopify',
    'Inventory quantity': variant.inventoryQuantity,
    'Continue selling when out of stock': 'DENY',
    'Weight value (grams)': /Shoes|Sneakers/.test(product.productType) ? 300 : product.productType === 'Backpacks' ? 700 : 250,
    'Weight unit for display': 'g',
    'Requires shipping': 'TRUE',
    'Fulfillment service': 'manual',
    'Product image URL': index === 0 ? product.images[0] : '',
    'Image position': index === 0 ? 1 : '',
    'Image alt text': index === 0 ? `${product.title} - primary view` : '',
    'Variant image URL': product.images[0],
    'Gift card': 'FALSE',
    'SEO title': index === 0 ? product.title : '',
    'SEO description': index === 0 ? `Shop ${product.title} at Sneaker Head.` : '',
    'Color (product.metafields.shopify.color-pattern)': index === 0 ? product.primaryColor : '',
    'Gender (product.metafields.custom.gender)': index === 0 ? product.gender : '',
    'Source SKU (product.metafields.custom.source_sku)': index === 0 ? product.sku : '',
    'Source URL (product.metafields.custom.source_url)': index === 0 ? product.sourceUrl : '',
  }));
  product.images.slice(1).forEach((image, index) => productRows.push({
    'URL handle': product.handle,
    'Product image URL': image,
    'Image position': index + 2,
    'Image alt text': `${product.title} - view ${index + 2}`,
  }));
}

const linkRows = products.filter((product) => linkableFamilyHandles.has(product.familyHandle)).map((product) => ({
  'Title': product.title,
  'URL handle': product.handle,
  'Colorway Family (product.metafields.custom.colorway_family)': product.familyHandle,
}));

const audit = {
  generatedAt: new Date().toISOString(),
  source: 'Foot Locker US',
  batchTag,
  policy: { inStockOnly: true, minimumGalleryImages: minGalleryImages, maximumGalleryImages: maxGalleryImages },
  totals: {
    products: products.length,
    variants: products.reduce((sum, product) => sum + product.variants.length, 0),
    images: products.reduce((sum, product) => sum + product.images.length, 0),
    families: families.length,
    excluded: excluded.length,
  },
  families: families.map((family) => ({ handle: family.handle, name: family.name, products: family.productHandles.length })),
  excluded,
};

await fs.writeFile(path.join(outputDir, 'products-import.csv'), '\ufeff' + toCsv(productRows, csvHeaders), 'utf8');
await fs.writeFile(path.join(outputDir, 'colorway-link-update.csv'), '\ufeff' + toCsv(linkRows, Object.keys(linkRows[0])), 'utf8');
await fs.writeFile(path.join(outputDir, 'product-payload.json'), JSON.stringify(products, null, 2) + '\n', 'utf8');
await fs.writeFile(path.join(outputDir, 'colorway-metaobject-manifest.json'), JSON.stringify(linkableFamilies, null, 2) + '\n', 'utf8');
await fs.writeFile(path.join(outputDir, 'source-audit.json'), JSON.stringify(audit, null, 2) + '\n', 'utf8');

console.log(JSON.stringify(audit.totals, null, 2));
