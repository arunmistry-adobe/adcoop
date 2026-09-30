import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/ue-utils.js';

/**
 * Full-bleed hero: background image with overlaid heading + text.
 * Tolerates image and text in the same cell or in separate cells/rows,
 * and a missing image (renders as a plain text hero).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  let media;

  if (picture) {
    // detach the picture and drop the paragraph it was wrapped in, if now empty
    const holder = picture.parentElement;
    picture.remove();
    if (holder && holder.tagName === 'P' && !holder.textContent.trim() && !holder.children.length) {
      holder.remove();
    }

    media = document.createElement('div');
    media.className = 'hero-fullbleed-media';
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt || '', true, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ])
      : picture;
    // the hero is the LCP candidate
    const optimizedImg = optimized.querySelector('img');
    // keep Universal Editor instrumentation on the rebuilt image
    if (img && optimizedImg) moveInstrumentation(img, optimizedImg);
    if (optimizedImg) {
      optimizedImg.loading = 'eager';
      optimizedImg.fetchPriority = 'high';
    }
    media.append(optimized);
  } else {
    block.classList.add('hero-fullbleed-no-image');
  }

  const content = document.createElement('div');
  content.className = 'hero-fullbleed-content';
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    content.append(...cell.childNodes);
  });

  const children = [];
  if (media) children.push(media);
  if (content.textContent.trim() || content.querySelector('*')) children.push(content);
  block.replaceChildren(...children);
}
