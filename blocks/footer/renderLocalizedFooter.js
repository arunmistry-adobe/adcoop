import { loadCSS } from '../../scripts/aem.js';
import { getLanguage } from '../../scripts/i18n.js';

const LABELS = {
  en: { top: 'Back to top' },
  ar: { top: 'العودة إلى الأعلى' },
};

/**
 * Returns the content wrappers of the footer fragment (one per authored section).
 * @param {Element} fragment
 * @returns {Element[]}
 */
function getSections(fragment) {
  return [...fragment.children].map((section) => section.querySelector('.default-content-wrapper') || section);
}

/**
 * True when the section only holds images (decorative artwork).
 * @param {Element} section
 * @returns {boolean}
 */
function isImageOnly(section) {
  return !!section.querySelector('img') && !section.textContent.trim() && !section.querySelector('a');
}

/**
 * Builds the brand column: logo, description and the paragraph of icon links.
 * @param {Element} section
 * @returns {Element}
 */
function buildBrand(section) {
  const brand = document.createElement('div');
  brand.className = 'site-footer-brand';
  [...section.children].forEach((el) => {
    const links = [...el.querySelectorAll('a')];
    if (links.length > 1 && links.every((a) => a.querySelector('img') && !a.textContent.trim())) {
      el.className = 'site-footer-social';
    } else if (el.querySelector('img')) {
      el.className = 'site-footer-logo';
    } else {
      el.className = 'site-footer-text';
    }
    brand.append(el);
  });
  return brand;
}

/**
 * Builds a link column. List items written as "label<br>value" become label/value pairs.
 * @param {Element} section
 * @returns {Element}
 */
function buildColumn(section) {
  const column = document.createElement('div');
  column.className = 'site-footer-column';
  column.append(...section.childNodes);
  column.querySelectorAll('li').forEach((li) => {
    const br = li.querySelector(':scope > br');
    if (!br) return;
    const label = document.createElement('span');
    label.className = 'site-footer-label';
    while (li.firstChild && li.firstChild !== br) label.append(li.firstChild);
    br.remove();
    const value = document.createElement('span');
    value.className = 'site-footer-value';
    value.append(...li.childNodes);
    li.append(label, value);
    li.classList.add('site-footer-pair');
  });
  return column;
}

/**
 * Renders the localized site footer from the footer fragment.
 * @param {Element} block The footer block element
 * @param {Element} fragment The loaded footer fragment
 */
export default async function renderLocalizedFooter(block, fragment) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/footer/renderLocalizedFooter.css`);
  const labels = LABELS[getLanguage()] || LABELS.en;
  const sections = getSections(fragment);

  const decoration = sections.filter(isImageOnly);
  const content = sections.filter((s) => !isImageOnly(s));
  const [brandSection, ...rest] = content;
  const columns = rest.filter((s) => s.querySelector('h2, h3, h4'));
  const bottomSection = rest.find((s) => !s.querySelector('h2, h3, h4'));

  const wrapper = document.createElement('div');
  wrapper.className = 'site-footer';

  const main = document.createElement('div');
  main.className = 'site-footer-main';
  if (brandSection) main.append(buildBrand(brandSection));
  columns.forEach((s) => main.append(buildColumn(s)));
  wrapper.append(main);

  if (bottomSection) {
    const bottom = document.createElement('div');
    bottom.className = 'site-footer-bottom';
    bottom.append(...bottomSection.childNodes);
    wrapper.append(bottom);
  }

  decoration.forEach((s) => {
    const art = document.createElement('div');
    art.className = 'site-footer-decoration';
    art.setAttribute('aria-hidden', 'true');
    art.append(...s.querySelectorAll('img'));
    wrapper.append(art);
  });

  const top = document.createElement('button');
  top.type = 'button';
  top.className = 'site-footer-top';
  top.setAttribute('aria-label', labels.top);
  top.innerHTML = '<svg viewBox="0 0 27 17" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M14.92 1.42 26.33 13.24l-2.85 2.96-9.98-10.35-9.98 10.35L.67 13.24 12.08 1.42a2 2 0 0 1 2.84 0Z"/></svg>';
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  wrapper.append(top);

  block.textContent = '';
  block.append(wrapper);
}
