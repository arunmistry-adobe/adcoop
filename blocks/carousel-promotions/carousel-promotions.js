import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/ue-utils.js';

const DEFAULT_LABELS = {
  en: {
    region: 'Carousel',
    previous: 'Previous promotion',
    next: 'Next promotion',
    slide: 'Promotion',
    of: 'of',
  },
  ar: {
    region: 'عرض دوّار',
    previous: 'العرض السابق',
    next: 'العرض التالي',
    slide: 'عرض',
    of: 'من',
  },
};

let instanceCount = 0;

const isRtl = (el) => getComputedStyle(el).direction === 'rtl';

function getLabels(block) {
  const lang = (document.documentElement.lang || '').toLowerCase().startsWith('ar') || isRtl(block)
    ? 'ar'
    : 'en';
  return DEFAULT_LABELS[lang];
}

function decorateCtas(content) {
  content.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    a.classList.add('carousel-promotions-cta');
    a.closest('p')?.classList.add('carousel-promotions-cta-wrapper');
    if (/wa\.me|whatsapp/i.test(href)) {
      a.classList.add('carousel-promotions-cta-whatsapp');
    } else if (/\.pdf(\?|#|$)/i.test(href) || a.hasAttribute('download')) {
      a.classList.add('carousel-promotions-cta-download');
    }
    // external links (WhatsApp, S3 PDF) open in a new tab
    try {
      if (new URL(href, window.location.href).origin !== window.location.origin) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    } catch {
      // ignore malformed urls
    }
  });
}

function createSlide(row, index, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-promotions-slide';
  slide.id = `carousel-promotions-${id}-slide-${index}`;
  slide.dataset.slideIndex = index;
  // keep Universal Editor instrumentation on the rebuilt slide
  moveInstrumentation(row, slide);

  const media = document.createElement('div');
  media.className = 'carousel-promotions-image';
  const content = document.createElement('div');
  content.className = 'carousel-promotions-content';

  let picture = null;
  [...row.children].forEach((cell) => {
    const pic = cell.querySelector('picture');
    if (pic && !picture) {
      picture = pic;
      pic.remove();
    }
    [...cell.children].forEach((child) => {
      if (child.tagName === 'P' && !child.textContent.trim() && !child.children.length) return;
      content.append(child);
    });
  });

  if (picture) {
    const img = picture.querySelector('img');
    media.append(img
      ? createOptimizedPicture(img.src, img.alt || '', false, [
        { media: '(min-width: 900px)', width: '900' },
        { width: '600' },
      ])
      : picture);
    if (img) moveInstrumentation(img, media.querySelector('img'));
    slide.append(media);
  }
  if (content.children.length) {
    decorateCtas(content);
    slide.append(content);
  }
  return slide;
}

/**
 * Promotions carousel: one row per promotion, [flyer image] [CTA links].
 * Renders without controls when there is only one slide. Direction-aware (RTL).
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  instanceCount += 1;
  const id = instanceCount;

  const rows = [...block.children].filter(
    (row) => row.textContent.trim() || row.querySelector('picture'),
  );

  const track = document.createElement('ul');
  track.className = 'carousel-promotions-track';
  track.id = `carousel-promotions-${id}-track`;
  const slides = rows.map((row, i) => createSlide(row, i, id));
  track.append(...slides);

  const labels = getLabels(block);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', labels.region);

  if (slides.length < 2) {
    block.classList.add('carousel-promotions-single');
    block.replaceChildren(track);
    return;
  }

  slides.forEach((slide, i) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', labels.slide);
    slide.setAttribute('aria-label', `${i + 1} ${labels.of} ${slides.length}`);
  });

  const controls = document.createElement('div');
  controls.className = 'carousel-promotions-controls';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'carousel-promotions-prev';
  prev.setAttribute('aria-label', labels.previous);
  prev.setAttribute('aria-controls', track.id);
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-promotions-next';
  next.setAttribute('aria-label', labels.next);
  next.setAttribute('aria-controls', track.id);
  // DOM order prev -> next; flex layout follows the writing direction, so in RTL
  // "previous" sits on the right (the reading start) automatically.
  controls.append(prev, next);

  const status = document.createElement('p');
  status.className = 'carousel-promotions-status';
  status.setAttribute('aria-live', 'polite');

  block.replaceChildren(controls, track, status);

  let active = 0;

  const setActive = (index) => {
    active = index;
    slides.forEach((slide, i) => {
      const hidden = i !== index;
      slide.setAttribute('aria-hidden', hidden);
      slide.querySelectorAll('a, button').forEach((el) => {
        if (hidden) el.setAttribute('tabindex', '-1');
        else el.removeAttribute('tabindex');
      });
    });
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    status.textContent = `${labels.slide} ${index + 1} ${labels.of} ${slides.length}`;
  };

  const goTo = (index) => {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    const slideRect = slides[target].getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    // align the slide's start edge with the track's start edge, using physical
    // deltas so this is correct regardless of the browser's RTL scrollLeft model
    const delta = isRtl(track)
      ? slideRect.right - trackRect.right
      : slideRect.left - trackRect.left;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: delta, behavior: smooth ? 'smooth' : 'auto' });
    setActive(target);
  };

  prev.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', () => goTo(active + 1));

  block.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.target.closest('input, textarea, select')) return;
    const forward = (e.key === 'ArrowRight') !== isRtl(block);
    e.preventDefault();
    goTo(active + (forward ? 1 : -1));
  });

  // keep state in sync with touch/trackpad swiping
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.dataset.slideIndex, 10);
        if (index !== active) setActive(index);
      }
    });
  }, { root: track, threshold: 0.6 });
  slides.forEach((slide) => observer.observe(slide));

  setActive(0);
}
