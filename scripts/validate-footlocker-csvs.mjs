import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Workbook } from '@oai/artifact-tool';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const batchArgIndex = process.argv.indexOf('--batch');
const batchDir = path.resolve(root, batchArgIndex >= 0 && process.argv[batchArgIndex + 1]
  ? process.argv[batchArgIndex + 1]
  : 'outputs/footlocker-catalog-batch');
const files = ['products-import.csv', 'colorway-link-update.csv'];
const results = [];

for (const file of files) {
  const csvText = (await fs.readFile(path.join(batchDir, file), 'utf8')).replace(/^\ufeff/, '');
  const workbook = await Workbook.fromCSV(csvText, { sheetName: 'Data' });
  const sheet = workbook.worksheets.getItem('Data');
  const used = sheet.getUsedRange(true);
  const inspection = await workbook.inspect({
    kind: 'table',
    sheetId: 'Data',
    range: used.address,
    include: 'values',
    tableMaxRows: 4,
    tableMaxCols: 50,
    maxChars: 6000,
  });
  const rows = used.values;
  const headers = rows[0];
  if (!headers.includes('URL handle')) throw new Error(`${file}: URL handle column is missing.`);
  if (rows.length < 2) throw new Error(`${file}: no data rows were generated.`);
  results.push({ file, rows: rows.length - 1, columns: headers.length, inspection: inspection.ndjson });
}

const products = JSON.parse(await fs.readFile(path.join(batchDir, 'product-payload.json'), 'utf8'));
const handles = products.map((product) => product.handle);
if (new Set(handles).size !== handles.length) throw new Error('Duplicate product handles found in payload.');
if (products.some((product) => !product.title || !product.vendor || !product.variants.length || product.images.length < 3)) {
  throw new Error('One or more payload products fail the clean-batch minimum requirements.');
}

console.log(JSON.stringify({ valid: true, products: products.length, files: results }, null, 2));
