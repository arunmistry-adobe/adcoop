import { loadFragment } from '../fragment/fragment.js';
import { getLanguageRoot, isLocalizedPage } from '../../scripts/i18n.js';

/**
 * loads and decorates the header: pages inside a language folder (/en/, /ar/) get the
 * localized site header, all other pages the storefront header. Each variant is loaded on
 * demand so corporate pages don't download the storefront code.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  if (isLocalizedPage()) {
    const [nav, { default: renderLocalizedHeader }] = await Promise.all([
      loadFragment(`${getLanguageRoot()}nav`),
      import('./renderLocalizedHeader.js'),
    ]);
    if (nav) await renderLocalizedHeader(block, nav);
    return;
  }

  const { default: decorateStorefrontHeader } = await import('./renderStorefrontHeader.js');
  await decorateStorefrontHeader(block);
}
