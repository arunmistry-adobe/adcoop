import { createOptimizedPicture } from '../../scripts/aem.js';

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
      const title = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (title && !cta.getAttribute('aria-label')) {
        cta.setAttribute('aria-label', `${cta.textContent.trim()}: ${title.textContent.trim()}`);
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
