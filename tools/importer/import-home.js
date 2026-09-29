/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroFullbleedParser from './parsers/hero-fullbleed.js';
import cardsPillarsParser from './parsers/cards-pillars.js';
import cardsBusinessParser from './parsers/cards-business.js';
import carouselPromotionsParser from './parsers/carousel-promotions.js';
import accordionStoresParser from './parsers/accordion-stores.js';

// TRANSFORMER IMPORTS
import adcoopCleanupTransformer from './transformers/adcoop-cleanup.js';
import adcoopSectionsTransformer from './transformers/adcoop-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-fullbleed': heroFullbleedParser,
  'cards-pillars': cardsPillarsParser,
  'cards-business': cardsBusinessParser,
  'carousel-promotions': carouselPromotionsParser,
  'accordion-stores': accordionStoresParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Corporate homepage (EN + AR language versions)',
  urls: [
    'https://corporate.adcoop.com/ar#home',
    'https://corporate.adcoop.com/en#home',
  ],
  blocks: [
    { name: 'hero-fullbleed', instances: ['#home > div.h-lvh'] },
    { name: 'cards-pillars', instances: ['#who-we-are div.w-full.gap-4.flex.overflow-hidden'] },
    { name: 'cards-business', instances: ['#our-business div.grid.gap-4'] },
    { name: 'carousel-promotions', instances: ['#latest-promotions div.relative.z-10.mx-auto.flex.flex-col'] },
    { name: 'accordion-stores', instances: ['#nearest-stores div.mt-8.grid.grid-cols-1'] },
  ],
  sections: [
    {
      id: 'rc1', name: 'Intro / Hero', selector: ['#home'], style: null, blocks: ['hero-fullbleed'], defaultContent: [],
    },
    {
      id: 'rc2', name: 'Who We Are', selector: ['#who-we-are'], style: null, blocks: ['cards-pillars'], defaultContent: ['#who-we-are div.relative.section-padding.pt-16'],
    },
    {
      id: 'rc3', name: 'Our Business', selector: ['#our-business'], style: 'purple', blocks: ['cards-business'], defaultContent: ['#our-business div.section-padding > div.flex.flex-col.justify-center'],
    },
    {
      id: 'rc4', name: 'Latest Promotions', selector: ['#latest-promotions'], style: 'purple', blocks: ['carousel-promotions'], defaultContent: ['#latest-promotions div.flex.section-padding.justify-between.items-center'],
    },
    {
      id: 'rc5', name: 'Nearest Stores', selector: ['#nearest-stores'], style: null, blocks: ['accordion-stores'], defaultContent: ['#nearest-stores h2'],
    },
  ],
};

// TRANSFORMER REGISTRY - section transformer runs after cleanup
const transformers = [
  adcoopCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [adcoopSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/**
 * Resolve the page language from the <html lang> attribute, falling back to
 * the first path segment of the source URL (/en, /ar).
 */
function getLanguage(document, originalURL) {
  const htmlLang = (document.documentElement.getAttribute('lang') || '').trim().toLowerCase();
  if (htmlLang) return htmlLang.split('-')[0];
  const [, first] = new URL(originalURL).pathname.split('/');
  return (first || 'en').toLowerCase();
}

/**
 * SVGs on the ADCOOP S3 bucket are hotlink-protected (only served to corporate.adcoop.com),
 * so reference local copies in the page's images folder instead. The files are downloaded by
 * tools/importer/fetch-protected-images.mjs after the import.
 */
const PROTECTED_IMAGE_HOST = 'prod-mairgroup.s3.eu-north-1.amazonaws.com';

function localizeProtectedImages(main) {
  main.querySelectorAll('img[src]').forEach((img) => {
    try {
      const src = new URL(img.getAttribute('src'));
      if (src.hostname !== PROTECTED_IMAGE_HOST || !/\.svg$/i.test(src.pathname)) return;
      const file = src.pathname.split('/').pop();
      // keep a query string so the SVG stays an image (bare .svg is treated as an icon)
      img.setAttribute('src', `./images/${file}?format=svg`);
      img.removeAttribute('srcset');
    } catch (e) {
      // leave relative or invalid URLs untouched
    }
  });
}

/**
 * Build the page Metadata block (title, description, image, language)
 */
function createMetadataBlock(main, document, lang) {
  const meta = {};
  const title = document.querySelector('title');
  if (title && title.textContent.trim()) meta.Title = title.textContent.trim();
  const desc = document.querySelector('meta[name="description"]');
  if (desc && desc.content) meta.Description = desc.content.trim();
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && ogImage.content) {
    const img = document.createElement('img');
    img.src = ogImage.content;
    meta.Image = img;
  }
  meta.Language = lang;
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    const lang = getLanguage(document, params.originalURL);

    // 1. Initial cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks using the embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section breaks / section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. Built-in rules + page metadata
    main.appendChild(document.createElement('hr'));
    createMetadataBlock(main, document, lang);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    localizeProtectedImages(main);

    // 6. Path: language homepages map to /<lang>/index (e.g. /en -> /en/index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    let targetPath;
    if (rawPath === '') targetPath = '/index';
    else if (/^\/[a-z]{2}$/i.test(rawPath)) targetPath = `${rawPath.toLowerCase()}/index`;
    else targetPath = rawPath;
    const path = WebImporter.FileUtils.sanitizePath(targetPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        language: lang,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
