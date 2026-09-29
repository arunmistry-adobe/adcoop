import { loadCSS } from '../../scripts/aem.js';
import { SITE_LANGUAGES, getAlternateLanguagePath, getLanguage } from '../../scripts/i18n.js';

const isDesktop = window.matchMedia('(width >= 900px)');

const LABELS = {
  en: { open: 'Open menu', close: 'Close menu', menu: 'Main' },
  ar: { open: 'فتح القائمة', close: 'إغلاق القائمة', menu: 'الرئيسية' },
};

/**
 * Normalizes a pathname for comparison (drops /content prefix, /index and trailing slash).
 * @param {string} pathname
 * @returns {string}
 */
function normalizePath(pathname) {
  return pathname
    .replace(/^\/content(?=\/)/, '')
    .replace(/\/index$/, '/')
    .replace(/\/$/, '') || '/';
}

/**
 * Returns the content wrappers of the nav fragment (one per authored section).
 * @param {Element} fragment
 * @returns {Element[]}
 */
function getSections(fragment) {
  return [...fragment.children].map((section) => section.querySelector('.default-content-wrapper') || section);
}

/**
 * Marks links pointing at the current page.
 * @param {Element} container
 */
function markCurrentLink(container) {
  const current = normalizePath(window.location.pathname);
  container.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.href, window.location);
    if (url.origin === window.location.origin && normalizePath(url.pathname) === current) {
      a.setAttribute('aria-current', 'page');
    }
  });
}

/**
 * Builds the language switch: each authored language link points at the
 * equivalent page in that language.
 * @param {Element} section
 * @returns {Element}
 */
function buildLanguageTools(section) {
  const tools = document.createElement('div');
  tools.className = 'site-nav-tools';
  section.querySelectorAll('a[href]').forEach((a) => {
    const [, lang] = new URL(a.href, window.location).pathname.split('/');
    if (SITE_LANGUAGES.includes(lang)) {
      a.href = getAlternateLanguagePath(lang);
      a.lang = lang;
      a.hreflang = lang;
    }
    a.className = 'site-nav-language';
    a.querySelectorAll('img').forEach((img) => img.setAttribute('aria-hidden', 'true'));
    tools.append(a);
  });
  return tools;
}

/**
 * Builds the slide-in drawer from the brand, the main links and the extra drawer content.
 * @param {Element} brand
 * @param {Element} links
 * @param {Element} [extras]
 * @returns {Element}
 */
function buildDrawer(brand, links, extras) {
  const drawer = document.createElement('div');
  drawer.className = 'site-drawer';
  drawer.id = 'site-drawer';

  const drawerBrand = brand.cloneNode(true);
  drawerBrand.className = 'site-drawer-brand';
  drawer.append(drawerBrand);

  const list = document.createElement('ul');
  list.className = 'site-drawer-links';
  links.querySelectorAll(':scope > li').forEach((li) => list.append(li.cloneNode(true)));
  extras?.querySelectorAll(':scope > ul > li').forEach((li) => list.append(li));
  drawer.append(list);

  extras?.querySelectorAll(':scope > p').forEach((p) => {
    if (!p.querySelector('a') && p.querySelector('img')) {
      p.className = 'site-drawer-decoration';
      p.setAttribute('aria-hidden', 'true');
    } else {
      p.className = 'site-drawer-social';
    }
    drawer.append(p);
  });
  return drawer;
}

/**
 * Renders the localized site header (brand, links, language switch, mobile drawer)
 * from the nav fragment.
 * @param {Element} block The header block element
 * @param {Element} fragment The loaded nav fragment
 */
export default async function renderLocalizedHeader(block, fragment) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/header/renderLocalizedHeader.css`);
  const labels = LABELS[getLanguage()] || LABELS.en;
  const [brandSection, linksSection, toolsSection, extrasSection] = getSections(fragment);

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.className = 'site-nav';
  nav.setAttribute('aria-label', labels.menu);

  const brand = document.createElement('div');
  brand.className = 'site-nav-brand';
  if (brandSection) brand.append(...brandSection.childNodes);

  const sections = document.createElement('div');
  sections.className = 'site-nav-links';
  const links = linksSection?.querySelector('ul') || document.createElement('ul');
  sections.append(links);

  const tools = toolsSection ? buildLanguageTools(toolsSection) : document.createElement('div');

  const toggle = document.createElement('div');
  toggle.className = 'site-nav-toggle';
  toggle.innerHTML = `<button type="button" aria-controls="site-drawer" aria-expanded="false" aria-label="${labels.open}">
      <span class="site-nav-toggle-icon"></span>
    </button>`;

  nav.append(brand, sections, tools, toggle);

  const drawer = buildDrawer(brand, links, extrasSection);
  const backdrop = document.createElement('div');
  backdrop.className = 'site-backdrop';

  [nav, drawer].forEach(markCurrentLink);

  const wrapper = document.createElement('div');
  wrapper.className = 'site-header';
  wrapper.append(nav, backdrop, drawer);
  block.textContent = '';
  block.append(wrapper);

  const button = toggle.querySelector('button');
  const toggleDrawer = (open) => {
    wrapper.classList.toggle('site-header-open', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', open ? labels.close : labels.open);
    drawer.toggleAttribute('inert', !open);
    // keep keyboard and screen-reader users inside the open drawer
    document.querySelectorAll('main, footer').forEach((el) => { el.inert = open; });
    if (open) drawer.querySelector('a')?.focus();
  };
  toggleDrawer(false);

  button.addEventListener('click', () => toggleDrawer(!wrapper.classList.contains('site-header-open')));
  backdrop.addEventListener('click', () => toggleDrawer(false));
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && wrapper.classList.contains('site-header-open')) {
      toggleDrawer(false);
      button.focus();
    }
  });

  // close the drawer when switching to the desktop layout
  isDesktop.addEventListener('change', () => toggleDrawer(false));

  // solid background once the page is scrolled (applied on small screens via CSS)
  const onScroll = () => wrapper.classList.toggle('site-header-scrolled', window.scrollY > 0);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
