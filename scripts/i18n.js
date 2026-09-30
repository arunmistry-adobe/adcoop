import { getMetadata } from './aem.js';

export const SITE_LANGUAGES = ['en', 'ar'];
export const DEFAULT_LANGUAGE = 'en';
const RTL_LANGUAGES = ['ar'];

/**
 * Finds the language folder in the current path, e.g. `/ar/...`
 * (or `/content/ar/...` when previewing locally).
 * @returns {{ index: number, segments: string[] }} index is -1 when not found
 */
function findLanguageSegment() {
  const segments = window.location.pathname.split('/');
  // only look at the first two folders so deep paths like /products/en are ignored
  const index = segments.slice(0, 3).findIndex((s) => SITE_LANGUAGES.includes(s));
  return { index, segments };
}

/**
 * Returns the current page language from the `language` metadata,
 * falling back to the language folder in the path.
 * @returns {string} language code
 */
export function getLanguage() {
  const meta = getMetadata('language').toLowerCase().split('-')[0];
  if (SITE_LANGUAGES.includes(meta)) return meta;
  const { index, segments } = findLanguageSegment();
  return index > -1 ? segments[index] : DEFAULT_LANGUAGE;
}

/**
 * True for pages inside a language folder (corporate pages). Keep in sync with the
 * storefront preload check in head.html.
 * @returns {boolean}
 */
export function isLocalizedPage() {
  return findLanguageSegment().index > -1;
}

/**
 * Returns the root path of the current language, e.g. `/ar/`.
 * @returns {string} language root path, always ending with `/`
 */
export function getLanguageRoot() {
  const { index, segments } = findLanguageSegment();
  return index > -1 ? `${segments.slice(0, index + 1).join('/')}/` : '/';
}

/**
 * Returns the equivalent path of the current page in another language.
 * @param {string} lang target language code
 * @returns {string} path in the target language
 */
export function getAlternateLanguagePath(lang) {
  const { index, segments } = findLanguageSegment();
  if (index === -1) return `/${lang}/`;
  const alternate = [...segments];
  alternate[index] = lang;
  return alternate.join('/');
}

/**
 * Sets `lang` and `dir` on the document element, and flags pages that live
 * inside a language folder so they can use the localized site chrome.
 */
export function decorateLanguage() {
  const lang = getLanguage();
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
  document.documentElement.classList.toggle('localized', isLocalizedPage());
}
