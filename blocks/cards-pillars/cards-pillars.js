import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/ue-utils.js';

/**
 * Brand pillar tiles: optional background image, title, clamped description and a
 * "Learn more" call-to-action bar rendered beneath each tile.
 * Each row: [image (may be empty)] [title, description, link].
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-pillars-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.some((c) => c.textContent.trim() || c.querySelector('picture'))) return;

    const li = document.createElement('li');
    li.className = 'cards-pillars-item';
    // keep Universal Editor instrumentation on the rebuilt item
    moveInstrumentation(row, li);

    const tile = document.createElement('div');
    tile.className = 'cards-pillars-tile';

    const body = document.createElement('div');
    body.className = 'cards-pillars-body';

    let picture = null;
    cells.forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !picture) {
        picture = pic;
        // any text sharing the image cell still belongs to the body
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
      media.className = 'cards-pillars-image';
      media.append(img
        ? createOptimizedPicture(img.src, img.alt || '', false, [{ width: '600' }])
        : picture);
      if (img) moveInstrumentation(img, media.querySelector('img'));
      tile.append(media);
    } else {
      li.classList.add('cards-pillars-no-image');
    }

    // the last link becomes the CTA bar below the tile
    const links = body.querySelectorAll('a[href]');
    const cta = links[links.length - 1];
    let ctaEl = null;
    if (cta) {
      const holder = cta.closest('p');
      cta.className = 'cards-pillars-cta';
      if (holder && body.contains(holder) && holder.textContent.trim() === cta.textContent.trim()) {
        holder.remove();
      } else {
        cta.remove();
      }
      // give each "Learn more" link its tile's context (visually hidden, part of the link text)
      const title = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (title) {
        const context = document.createElement('span');
        context.className = 'cards-pillars-cta-context';
        context.textContent = `: ${title.textContent.trim()}`;
        cta.append(context);
      }
      ctaEl = cta;
    }

    body.querySelectorAll('p').forEach((p) => {
      if (!p.querySelector('a, picture')) p.classList.add('cards-pillars-text');
    });

    tile.append(body);
    li.append(tile);
    if (ctaEl) li.append(ctaEl);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
