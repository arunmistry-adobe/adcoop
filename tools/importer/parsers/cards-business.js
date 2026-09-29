/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-business. Base: cards.
 * Source: https://corporate.adcoop.com/en (also /ar, identical DOM, RTL).
 * Block model (blocks/cards-business/cards-business.js): 2 cells per row:
 *   [image] | [H3 containing link]
 * Selectors verified in migration-work/block-context/cards-business/source.html:
 *   div.grid > a.img-hover-out[href] > img.blog-img-out + h3 + div.shadow-bg
 * The tiles are adjacent sibling <a> elements with identical hrefs, which html2md's preprocessing
 * can merge into one anchor. So iteration is keyed on the inner <h3> (block-level) and each h3 is
 * paired with its preceding <img>; the href is read from the enclosing <a>.
 * No text matching (EN + AR share the DOM).
 */
export default function parse(element, { document }) {
  const headings = Array.from(element.querySelectorAll('h3, h2, h4'));

  const cells = [];
  headings.forEach((heading) => {
    // Image: nearest preceding sibling <img> (robust even if anchors were merged)
    let image = null;
    let prev = heading.previousElementSibling;
    while (prev && !image) {
      if (prev.tagName === 'IMG') image = prev;
      else if (prev.querySelector && prev.querySelector('img')) {
        const imgs = prev.querySelectorAll('img');
        image = imgs[imgs.length - 1];
      } else if (/^H[1-6]$/.test(prev.tagName)) break;
      prev = prev.previousElementSibling;
    }
    if (!image) {
      const wrap = heading.closest('a') || heading.parentElement;
      image = wrap && wrap.querySelector('img');
    }

    const anchor = heading.closest('a[href]') || heading.querySelector('a[href]');
    const title = document.createElement('h3');
    const text = heading.textContent.trim();
    if (anchor) {
      const link = document.createElement('a');
      link.href = anchor.getAttribute('href');
      link.textContent = text;
      title.append(link);
    } else {
      title.textContent = text;
    }

    cells.push([image || '', title]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-business', cells });
  element.replaceWith(block);
}
