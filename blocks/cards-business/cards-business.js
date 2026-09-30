import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/ue-utils.js';

/**
 * Business-line banner tiles: background photo + overlaid (linked) title.
 * Each row: [image] [H3 with link]. The whole tile is clickable via a stretched link.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-business-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.some((c) => c.textContent.trim() || c.querySelector('picture'))) return;

    const li = document.createElement('li');
    li.className = 'cards-business-item';
    // keep Universal Editor instrumentation on the rebuilt item
    moveInstrumentation(row, li);

    const body = document.createElement('div');
    body.className = 'cards-business-body';

    let picture = null;
    cells.forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !picture) {
        picture = pic;
        pic.remove();
      }
      [...cell.children].forEach((child) => {
        if (child.tagName === 'P' && !child.textContent.trim() && !child.children.length) return;
        body.append(child);
      });
    });

    if (picture) {
      const img = picture.querySelector('img');
      const media = document.createElement('div');
      media.className = 'cards-business-image';
      media.append(img
        ? createOptimizedPicture(img.src, img.alt || '', false, [
          { media: '(min-width: 900px)', width: '900' },
          { width: '750' },
        ])
        : picture);
      if (img) moveInstrumentation(img, media.querySelector('img'));
      li.append(media);
    } else {
      li.classList.add('cards-business-no-image');
    }

    // prefer the link inside the heading; fall back to the first link in the body
    const link = body.querySelector('h1 a, h2 a, h3 a, h4 a, h5 a, h6 a') || body.querySelector('a[href]');
    if (link) {
      link.className = 'cards-business-link';
      link.closest('.button-wrapper')?.classList.remove('button-wrapper');
      li.classList.add('cards-business-linked');
    }

    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
