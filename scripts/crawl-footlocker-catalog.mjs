import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}
const sourcePath = path.resolve(root, arg('--source', 'data/footlocker/seed-groups.json'));
const outputPath = path.resolve(root, arg('--output', 'data/footlocker/details'));
const progressPath = path.resolve(root, arg('--progress', 'data/footlocker/crawl-progress.json'));
const source = JSON.parse(await fs.readFile(sourcePath,'utf8'));
const out = outputPath;
await fs.mkdir(out,{recursive:true});
const failures=[];
let count=0;
for (const group of source.groups) {
  for (const colorway of group.colorways) {
    const file=path.join(out,`${colorway.sku}.json`);
    try { await fs.access(file); count++; continue; } catch {}
    try {
      const response=await fetch(colorway.source_url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Mozilla/5.0'}});
      if ([403,429].includes(response.status)) throw new Error(`BLOCKED ${response.status}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html=await response.text();
      const line=html.split(/\r?\n/).find(x=>x.includes('window.__REACT_QUERY_STATE__'));
      if (!line) throw new Error('Product state missing');
      const state=JSON.parse(line.slice(line.indexOf('{'),line.lastIndexOf('}')+1));
      const data=state.queries.find(x=>x.queryKey?.[0]==='product' && x.queryKey?.[1]===colorway.sku)?.state?.data;
      if (!data) throw new Error('Selected colorway data missing');
      const ldMatch=html.match(/<script[^>]*id="productLdJson"[^>]*>([\s\S]*?)<\/script>/i);
      const ld=ldMatch?JSON.parse(ldMatch[1]):null;
      await fs.writeFile(file,JSON.stringify({fetchedAt:new Date().toISOString(),sourceUrl:colorway.source_url,brand:group.brand,category:group.category,segment:group.segment,groupTitle:group.title,groupId:group.product_group_id,data,ld},null,2));
      count++;
      console.log(`${count}: ${colorway.sku}`);
    } catch(error) {
      failures.push({sku:colorway.sku,error:error.message});
      console.log(`FAILED ${colorway.sku}: ${error.message}`);
      if (error.message.startsWith('BLOCKED')) break;
    }
  }
  if(failures.some(x=>x.error.startsWith('BLOCKED'))) break;
}
await fs.writeFile(progressPath,JSON.stringify({fetched:count,failures},null,2));
console.log(JSON.stringify({fetched:count,failures}));
