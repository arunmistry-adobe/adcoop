/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-stores. Base: accordion.
 * Source: https://corporate.adcoop.com/en (also /ar, identical DOM, RTL).
 * Block model (blocks/accordion-stores/accordion-stores.js): one row per store, 2 cells:
 *   [store name] | [details: address paragraph, phone paragraph (tel link), opening times]
 * (an optional 3rd "lat,lng" cell is supported by the block; the source has no coordinates).
 * Selectors verified in migration-work/block-context/accordion-stores/source.html:
 *   div.md:col-span-4 (desktop list) > ... > div.border-b > details.group
 *     summary > span.font-semibold (name)
 *     div.py-4 > p.mb-2 (span label + text) | p.mb-2 (span label + a[href^=tel:]) |
 *                div.text-12 > p (label) + ul > li (span day + span hours)
 * The mobile duplicate list (div.block.md:hidden) is ignored. Phone lines whose href is
 * tel:null / tel:N/A / tel:NA / empty are dropped. Labels are kept verbatim in the source
 * language — no text matching anywhere (EN + AR share the DOM).
 */

const BAD_TEL = ['', 'null', 'undefined', 'n/a', 'na', '-'];

function isBadTel(a) {
  const href = (a.getAttribute('href') || '').replace(/^tel:/i, '').trim().toLowerCase();
  return BAD_TEL.includes(href);
}

function cleanText(node) {
  return (node ? node.textContent : '').replace(/\s+/g, ' ').trim();
}

// Build <p><strong>Label</strong> rest</p> from a source paragraph whose first child is a label span.
function buildLabelledParagraph(srcP, document) {
  const p = document.createElement('p');
  const label = srcP.querySelector(':scope > span.font-semibold, :scope > span:first-child, :scope > strong, :scope > b');
  if (label) {
    const strong = document.createElement('strong');
    strong.textContent = cleanText(label);
    p.append(strong);
  }
  const link = srcP.querySelector('a[href]');
  if (link) {
    const a = document.createElement('a');
    a.href = link.getAttribute('href').trim();
    a.textContent = cleanText(link) || a.getAttribute('href').replace(/^tel:/i, '').trim();
    p.append(' ', a);
  } else {
    // remaining text after the label
    const clone = srcP.cloneNode(true);
    const cloneLabel = label ? clone.querySelector(':scope > span.font-semibold, :scope > span:first-child, :scope > strong, :scope > b') : null;
    if (cloneLabel) cloneLabel.remove();
    const rest = cleanText(clone);
    if (rest) p.append(label ? ' ' : '', rest);
  }
  return p;
}

function buildBody(panel, document) {
  const out = [];
  if (!panel) return out;

  Array.from(panel.children).forEach((child) => {
    if (child.tagName === 'P') {
      const tel = child.querySelector('a[href^="tel:"]');
      if (tel && isBadTel(tel)) return; // drop phone lines without a real number
      if (!cleanText(child)) return;
      out.push(buildLabelledParagraph(child, document));
    } else if (child.querySelector('ul, ol')) {
      // Opening times: label paragraph + list of day / hours
      const labelP = child.querySelector(':scope > p');
      if (labelP && cleanText(labelP)) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = cleanText(labelP);
        p.append(strong);
        out.push(p);
      }
      const list = child.querySelector('ul, ol');
      const ul = document.createElement('ul');
      Array.from(list.querySelectorAll(':scope > li')).forEach((li) => {
        // day and hours are separate child nodes (spans or text) - join as "day: hours"
        const parts = Array.from(li.childNodes).map(cleanText).filter(Boolean);
        const item = document.createElement('li');
        item.textContent = parts.length >= 2
          ? `${parts[0]}: ${parts.slice(1).join(' ')}`
          : cleanText(li);
        if (item.textContent) ul.append(item);
      });
      if (ul.children.length) out.push(ul);
    } else if (cleanText(child)) {
      // Unknown extra block: keep its text
      const p = document.createElement('p');
      p.textContent = cleanText(child);
      out.push(p);
    }
  });
  return out;
}

export default function parse(element, { document }) {
  // Prefer the desktop list; fall back to every <details> outside the mobile duplicate list.
  const desktop = element.querySelector(':scope > div.hidden');
  let items = desktop ? Array.from(desktop.querySelectorAll('details')) : [];
  if (!items.length) {
    items = Array.from(element.querySelectorAll('details'))
      .filter((d) => !d.closest('div.block.md\\:hidden'));
  }

  const cells = [];
  items.forEach((details) => {
    const summary = details.querySelector(':scope > summary');
    if (!summary) return;
    const nameEl = summary.querySelector('span.font-semibold') || summary.querySelector('span') || summary;
    const name = cleanText(nameEl);
    if (!name) return;

    const panel = details.querySelector(':scope > div') || details;
    const body = buildBody(panel, document);

    cells.push([name, body.length ? body : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-stores', cells });
  element.replaceWith(block);
}
