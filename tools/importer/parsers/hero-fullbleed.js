/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-fullbleed. Base: hero.
 * Source: https://corporate.adcoop.com/en (also /ar, identical DOM, RTL).
 * Block model (blocks/hero-fullbleed/README.md): 1 column, 1 content row,
 * single cell = background image + H1 + paragraph.
 * Selectors verified in migration-work/block-context/hero-fullbleed/source.html:
 *   <div class="h-lvh relative"> <img class="w-full h-full object-cover">
 *   <div class="section-padding absolute ..."> <h1 class="hero-heading"> <p class="text-22 ...">
 * No text matching (EN + AR share the same DOM).
 */
export default function parse(element, { document }) {
  // Background image: direct child img (fallback: any img in the block)
  const bgImage = element.querySelector(':scope > img') || element.querySelector('img');

  // Text overlay container (fallback: the block itself)
  const content = element.querySelector(':scope > div.section-padding')
    || element.querySelector(':scope > div')
    || element;

  const heading = content.querySelector('h1, .hero-heading, h2');
  const paragraphs = Array.from(content.querySelectorAll('p'));
  const ctas = Array.from(content.querySelectorAll('a[href]')).filter((a) => !a.closest('p'));

  if (!bgImage && !heading && !paragraphs.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (bgImage) contentCell.push(bgImage);
  if (heading) contentCell.push(heading);
  contentCell.push(...paragraphs);
  contentCell.push(...ctas);

  const cells = [[contentCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-fullbleed', cells });
  element.replaceWith(block);
}
