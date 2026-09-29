/* eslint-disable no-console */
/*
 * Downloads images that the ADCOOP S3 bucket only serves to corporate.adcoop.com (hotlink
 * protection) into content/<lang>/images/, so the migrated pages can reference local copies.
 *
 * The import script rewrites these images to ./images/<file>; run this after an import:
 *   node tools/importer/fetch-protected-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const PROTECTED_BASE = 'https://prod-mairgroup.s3.eu-north-1.amazonaws.com/';
const REFERER = 'https://corporate.adcoop.com/';

const pages = fs.readdirSync('content', { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join('content', d.name, 'index.plain.html'))
  .filter((f) => fs.existsSync(f));

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const files = [...new Set([...html.matchAll(/src="\.\/images\/([^"?]+)[^"]*"/g)].map((m) => m[1]))];
  const dir = path.join(path.dirname(page), 'images');
  fs.mkdirSync(dir, { recursive: true });
  for (const file of files) {
    const target = path.join(dir, file);
    if (fs.existsSync(target) && fs.statSync(target).size > 0) continue;
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(`${PROTECTED_BASE}${file}`, { headers: { Referer: REFERER, 'User-Agent': 'Mozilla/5.0' } });
    if (!resp.ok) {
      console.error(`FAILED ${file}: ${resp.status}`);
      continue;
    }
    // eslint-disable-next-line no-await-in-loop
    fs.writeFileSync(target, Buffer.from(await resp.arrayBuffer()));
    console.log(`saved ${target} (${fs.statSync(target).size} bytes)`);
  }
}
