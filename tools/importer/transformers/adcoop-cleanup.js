/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ADCOOP corporate site cleanup.
 * All selectors verified in migration-work/cleaned.html (EN). The AR page (lang=ar, dir=rtl)
 * shares the identical DOM, so no language-specific text is used anywhere.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Remove the closest ancestor matching `ancestorSel` for each element matching `sel`.
function removeClosest(root, sel, ancestorSel) {
  root.querySelectorAll(sel).forEach((el) => {
    const target = el.closest(ancestorSel);
    if (target && root.contains(target)) target.remove();
  });
}

// Next.js image proxy (/_next/image?url=<original>&w=..&q=..): point images at the original
// file so the query string (which EDS image optimization strips) is not needed.
function unwrapNextImages(root) {
  root.querySelectorAll('img[src*="/_next/image"], source[srcset*="/_next/image"]').forEach((el) => {
    const attr = el.tagName === 'IMG' ? 'src' : 'srcset';
    try {
      const proxied = new URL(el.getAttribute(attr).split(/\s+/)[0], 'https://corporate.adcoop.com/');
      const original = proxied.searchParams.get('url');
      if (!original) return;
      el.setAttribute(attr, new URL(original, proxied.origin).href);
      if (attr === 'src') el.removeAttribute('srcset');
    } catch (e) {
      // leave the attribute as is
    }
  });
}

// Bare ".svg" image URLs are treated as icons (":name:") by the importer / document pipeline,
// so default-content SVG pictures break. Add a query string (as the block parsers do) so they
// stay real images.
function keepSvgAsImage(root) {
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!src || src.startsWith('data:')) return;
    try {
      const url = new URL(src, 'https://corporate.adcoop.com/');
      if (!/\.svg$/i.test(url.pathname) || url.search) return;
      url.searchParams.set('format', 'svg');
      img.setAttribute('src', url.href);
      img.removeAttribute('srcset');
    } catch (e) {
      // leave the attribute as is
    }
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    unwrapNextImages(element);

    // Latest Promotions decorative pattern is an inline CSS background on the purple wrapper;
    // drop it so the importer does not turn it into an authored image.
    element.querySelectorAll('#latest-promotions [style*="background"]').forEach((el) => {
      el.style.removeProperty('background-image');
    });

    // Decorative lottie animations (who-we-are tiles, our-business skyline animation-bg,
    // latest-promotions): <div class="lf-player-container"><div id="lottie">
    WebImporter.DOMUtils.remove(element, ['.lf-player-container']);

    // Decorative line-art images
    WebImporter.DOMUtils.remove(element, [
      // cauliflower: <img class="absolute w-20 opacity-40 sm:w-40 ..."> in #who-we-are
      '#who-we-are img.absolute.w-20.opacity-40',
      // ice-cream: <img class="absolute hidden md:block w-32 ... opacity-40"> in #nearest-stores
      '#nearest-stores img.absolute.w-32.opacity-40',
      // promotions background: first <img> directly inside the purple wrapper
      '#latest-promotions > div > img',
      // promoAnimation badge: <img class="absolute top-6 ... right-0 translate-x-[70%] h-14 ...">
      '#latest-promotions img.absolute.right-0.h-14',
      // flyer hover "open" overlay: <div class="open-flayer-promo ...">
      '#latest-promotions div.open-flayer-promo',
    ]);

    // Latest Promotions prev/next slider arrows: sibling <div class="flex rtl:flex-row-reverse gap-4 md:gap-10">
    // next to the H2 inside <div class="flex section-padding justify-between items-center w-full">
    WebImporter.DOMUtils.remove(element, [
      '#latest-promotions div.flex.section-padding.justify-between.items-center > div',
    ]);

    // Nearest Stores: Google Maps column <div class="md:col-span-8 bg-primary-1-50 relative">
    WebImporter.DOMUtils.remove(element, [
      '#nearest-stores div.md\\:col-span-8',
      '.gm-style',
    ]);
    // Nearest Stores: mobile duplicate store list <div class="block md:hidden"> (keep desktop list)
    WebImporter.DOMUtils.remove(element, ['#nearest-stores div.block.md\\:hidden']);
    // Nearest Stores: "Use My Location" row <div class="flex gap-5 items-center justify-between">
    WebImporter.DOMUtils.remove(element, ['#nearest-stores div.flex.gap-5.items-center.justify-between']);
    // Nearest Stores: search input wrapper <div class="relative"><input ...><img></div>
    removeClosest(element, '#nearest-stores input', 'div.relative');
    WebImporter.DOMUtils.remove(element, ['#nearest-stores input']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global header / nav: <div class="fixed top-0 left-0 z-50 w-full transition-colors">
    // (logo, desktop menu links, language switcher button, mobile menu overlay + social icons + line-art)
    WebImporter.DOMUtils.remove(element, ['div.fixed.top-0.left-0.z-50']);

    // Right-side 01-05 section pager: <div class="fixed h-[60vh] ... font-bukra-semibold"> holding
    // <a href="#home">, <a href="#who-we-are"> ... <a href="#nearest-stores">
    removeClosest(element, 'a[href="#nearest-stores"]', 'div.fixed');

    // default-content SVG images (e.g. the Who We Are sculpture) must stay images
    keepSvgAsImage(element);

    // Google Maps font-loading probe (<span>BESbswy</span>) left in the page by the maps script
    element.querySelectorAll('span, p, div').forEach((el) => {
      if (!el.children.length && el.textContent.trim() === 'BESbswy') el.remove();
    });

    // Footer and remaining non-authorable elements
    WebImporter.DOMUtils.remove(element, [
      'footer',
      'next-route-announcer',
      'iframe',
      'script',
      'noscript',
      'style',
      'link',
    ]);
  }
}
