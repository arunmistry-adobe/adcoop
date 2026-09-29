/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-promotions. Base: carousel.
 * Source: https://corporate.adcoop.com/en (also /ar, identical DOM, RTL).
 * Block model (blocks/carousel-promotions/carousel-promotions.js): one row per slide, 2 cells:
 *   [flyer image] | [CTA links (WhatsApp, PDF download)]
 * Selectors verified in migration-work/block-context/carousel-promotions/source.html:
 *   div.relative.w-fit > img.flayer-promo-img (+ decorative badge img.absolute, hover overlay)
 *   div.grid > a[href] (icon div + label div)
 * Currently one slide; multiple flyers are supported (one row each, paired with the CTAs in the
 * same slide / nearest shared container). No text matching (EN + AR share the DOM).
 */

// helix-importer's convertIcons turns any <img> whose src ends with ".svg" into a :name: icon.
// The flyer is a content image, so keep it an image: absolutise the src and add a harmless
// query string so the extension check no longer matches.
function keepSvgAsImage(img, document) {
  const src = img.getAttribute('src') || '';
  if (/\.svg$/i.test(src)) {
    let abs = src;
    try {
      abs = new URL(src, document.baseURI || 'https://corporate.adcoop.com/').href;
    } catch (e) { /* keep original src */ }
    img.setAttribute('src', `${abs}?format=svg`);
  }
  return img;
}

function isFlyerCandidate(img) {
  const src = img.getAttribute('src') || '';
  return !src.startsWith('data:')
    && !img.closest('a')
    && !img.closest('.open-flayer-promo')
    && !img.classList.contains('absolute');
}

// Rebuild a CTA as a plain link with its label text (drops the decorative icon).
function buildCta(a, document) {
  const labelEl = a.querySelector(':scope > div:last-child, :scope > span:last-child');
  const label = ((labelEl && labelEl.textContent) || a.textContent || '').trim();
  const link = document.createElement('a');
  link.href = a.getAttribute('href');
  link.textContent = label || a.getAttribute('href');
  const p = document.createElement('p');
  p.append(link);
  return p;
}

export default function parse(element, { document }) {
  let flyers = Array.from(element.querySelectorAll('img.flayer-promo-img'));
  if (!flyers.length) flyers = Array.from(element.querySelectorAll('img')).filter(isFlyerCandidate);

  const allLinks = Array.from(element.querySelectorAll('a[href]'));

  const cells = [];
  if (flyers.length <= 1) {
    // Single slide: the flyer + every CTA in the block
    const flyer = flyers[0];
    if (!flyer && !allLinks.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    cells.push([
      flyer ? keepSvgAsImage(flyer, document) : '',
      allLinks.map((a) => buildCta(a, document)),
    ]);
  } else {
    // Multiple slides: pair each flyer with the CTAs in its own slide container, i.e. the
    // lowest ancestor that holds links but no other flyer.
    flyers.forEach((flyer) => {
      let scope = flyer.closest('.swiper-slide');
      if (!scope) {
        let node = flyer.parentElement;
        while (node && node !== element) {
          const parent = node.parentElement;
          const others = parent ? flyers.filter((f) => f !== flyer && parent.contains(f)) : [];
          if (node.querySelector('a[href]') || !parent || others.length) break;
          node = parent;
        }
        scope = node || element;
      }
      const links = Array.from(scope.querySelectorAll('a[href]'));
      cells.push([keepSvgAsImage(flyer, document), links.map((a) => buildCta(a, document))]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-promotions', cells });
  element.replaceWith(block);
}
