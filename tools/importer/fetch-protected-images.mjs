/* eslint-disable no-console */
/*
 * Localizes the ADCOOP SVG artwork referenced by the imported pages.
 *
 * The source SVGs are hotlink-protected (only served to corporate.adcoop.com) and each one
 * wraps a large embedded photo (~0.7-1 MB), which Document Authoring rejects. The import
 * script rewrites them to ./images/<name>.png; this script downloads each SVG and renders it
 * to a transparent PNG at 2x, next to the page (content/<lang>/images/).
 *
 * Usage (after an import):
 *   node tools/importer/fetch-protected-images.mjs
 * Requires Playwright; set PLAYWRIGHT_REQUIRE_FROM to a folder with playwright installed if it
 * is not a project dependency.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const SOURCES = [
  'https://prod-mairgroup.s3.eu-north-1.amazonaws.com/',
  'https://corporate.adcoop.com/_next/static/media/',
];
const REFERER = 'https://corporate.adcoop.com/';
const SCALE = 2;

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch (e) {
    const from = process.env.PLAYWRIGHT_REQUIRE_FROM;
    if (!from) throw new Error('playwright not found - set PLAYWRIGHT_REQUIRE_FROM');
    return createRequire(path.join(from, 'noop.js'))('playwright');
  }
}

async function downloadSvg(name) {
  for (const base of SOURCES) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(`${base}${name}.svg`, { headers: { Referer: REFERER, 'User-Agent': 'Mozilla/5.0' } });
    if (resp.ok) return resp.text();
  }
  return null;
}

const pages = fs.readdirSync('content', { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join('content', d.name, 'index.plain.html'))
  .filter((f) => fs.existsSync(f));

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: SCALE });

for (const doc of pages) {
  const html = fs.readFileSync(doc, 'utf8');
  const names = [...new Set([...html.matchAll(/src="\.\/images\/([^"?]+)\.png[^"]*"/g)].map((m) => m[1]))];
  const dir = path.join(path.dirname(doc), 'images');
  fs.mkdirSync(dir, { recursive: true });
  for (const name of names) {
    const target = path.join(dir, `${name}.png`);
    if (fs.existsSync(target) && fs.statSync(target).size > 0) continue;
    // eslint-disable-next-line no-await-in-loop
    const svg = await downloadSvg(name);
    if (!svg) {
      console.error(`FAILED ${name}: not found on any source`);
      continue;
    }
    // render at the SVG's intrinsic size on a transparent page
    // eslint-disable-next-line no-await-in-loop
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    // eslint-disable-next-line no-await-in-loop
    const el = await page.$('svg');
    // eslint-disable-next-line no-await-in-loop
    await el.screenshot({ path: target, omitBackground: true });
    console.log(`saved ${target} (${fs.statSync(target).size} bytes)`);
  }
}
await browser.close();
