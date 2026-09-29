/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-pillars. Base: cards.
 * Source: https://corporate.adcoop.com/en (also /ar, identical DOM, RTL).
 * Block model (blocks/cards-pillars/cards-pillars.js): 2 cells per row:
 *   [image (may be empty)] | [H3 title, description paragraph, link]
 * Selectors verified in migration-work/block-context/cards-pillars/source.html:
 *   div.swiper-slide > div > div.flex.flex-col > div.relative (h3, div.text-18, img.absolute)
 *   + sibling a[href] (div label + decorative arrow svg img)
 * Two slides are empty spacers (skipped). Two tiles only had a lottie animation (removed by the
 * cleanup transformer) — emit an empty image cell. No text matching (EN + AR share the DOM).
 */
// helix-importer's convertIcons turns any <img> whose src ends with ".svg" into a :name: icon.
// These are content images (tile artwork), so keep them as images: absolutise the src and add
// a harmless query string so the extension check no longer matches.
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

export default function parse(element, { document }) {
  // Iterate the block-level slide wrappers (never the anchors) and keep only real tiles.
  let slides = Array.from(element.querySelectorAll('.swiper-slide'))
    .filter((slide) => slide.querySelector('h1, h2, h3, h4, h5, h6'));
  if (!slides.length) {
    // Fallback: any container that holds a heading
    slides = Array.from(element.querySelectorAll('h3')).map((h) => h.closest('div.relative') || h.parentElement);
  }

  const cells = [];
  slides.forEach((slide) => {
    const heading = slide.querySelector('h3, h2, h4');
    if (!heading) return;

    // Background tile image: a real <img> that is not inside the CTA link or a lottie wrapper
    // and is not an inline data: svg icon.
    const image = Array.from(slide.querySelectorAll('img')).find((img) => {
      const src = img.getAttribute('src') || '';
      return !img.closest('a') && !img.closest('.lf-player-container') && !src.startsWith('data:');
    });

    // Description: the text div that follows the heading
    const textWrap = heading.parentElement;
    const descEl = textWrap.querySelector(':scope > div, :scope > p');
    let description = null;
    if (descEl && descEl.textContent.trim()) {
      description = document.createElement('p');
      description.textContent = descEl.textContent.trim();
    }

    // CTA link: rebuild with the label text only (drop decorative arrow icon)
    const link = slide.querySelector('a[href]');
    let cta = null;
    if (link) {
      const label = (link.querySelector('div, span') || link).textContent.trim();
      cta = document.createElement('a');
      cta.href = link.getAttribute('href');
      cta.textContent = label || link.getAttribute('href');
    }

    const title = document.createElement('h3');
    title.textContent = heading.textContent.trim();

    const body = [title];
    if (description) body.push(description);
    if (cta) {
      const p = document.createElement('p');
      p.append(cta);
      body.push(p);
    }

    cells.push([image ? keepSvgAsImage(image, document) : '', body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-pillars', cells });
  element.replaceWith(block);
}
