import { loadFragment } from '../fragment/fragment.js';
import { getLanguageRoot, isLocalizedPage } from '../../scripts/i18n.js';

/**
 * loads and decorates the footer: pages inside a language folder (/en/, /ar/) get the
 * localized site footer, all other pages the storefront footer. Each variant is loaded on
 * demand so corporate pages don't download the storefront code.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  if (isLocalizedPage()) {
    const [footer, { default: renderLocalizedFooter }] = await Promise.all([
      loadFragment(`${getLanguageRoot()}footer`),
      import('./renderLocalizedFooter.js'),
    ]);
    if (footer) await renderLocalizedFooter(block, footer);
    return;
  }

  const { default: decorateStorefrontFooter } = await import('./renderStorefrontFooter.js');
  await decorateStorefrontFooter(block);
}
