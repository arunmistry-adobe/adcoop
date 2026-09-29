/*
 * Accordion Stores (store locator)
 * Rows: [store name] [details: address / phone / opening times] [optional "lat,lng"]
 * Adds a search filter, "Use My Location" and a Google Maps embed for the selected store.
 */

const LABELS = {
  en: {
    locate: 'Use My Location',
    locating: 'Locating…',
    search: 'Search stores',
    searchPlaceholder: 'Search',
    results: (n, total) => `${n} of ${total} stores`,
    noResults: 'No stores match your search.',
    directions: 'Get directions',
    mapTitle: 'Map showing the selected store',
    yourLocation: 'Showing your location. Stores are listed in their default order.',
    nearest: (name) => `Nearest store: ${name}`,
    geoUnsupported: 'Location is not available in this browser.',
    geoDenied: 'We could not get your location. Please check your browser permissions.',
    addressLabels: ['address'],
  },
  ar: {
    locate: 'استخدم موقعي',
    locating: 'جارٍ تحديد الموقع…',
    search: 'ابحث عن المتاجر',
    searchPlaceholder: 'بحث',
    results: (n, total) => `${n} من ${total} متجر`,
    noResults: 'لا توجد متاجر مطابقة لبحثك.',
    directions: 'احصل على الاتجاهات',
    mapTitle: 'خريطة تعرض المتجر المحدد',
    yourLocation: 'يتم عرض موقعك. المتاجر مرتبة بالترتيب الافتراضي.',
    nearest: (name) => `أقرب متجر: ${name}`,
    geoUnsupported: 'تحديد الموقع غير متاح في هذا المتصفح.',
    geoDenied: 'تعذر الحصول على موقعك. يرجى التحقق من أذونات المتصفح.',
    addressLabels: ['العنوان', 'address'],
  },
};

const LAT_LNG = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;
const LEADING_NUMBER = /^\s*\d+\s*[.)-]\s*/;

let instanceCount = 0;

function getLang(block) {
  const lang = (document.documentElement.lang || '').toLowerCase();
  if (lang.startsWith('ar') || getComputedStyle(block).direction === 'rtl') return 'ar';
  return 'en';
}

/** lowercases and strips Latin accents + Arabic diacritics/tatweel for forgiving matching */
function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseLatLng(cell) {
  const match = cell?.textContent.match(LAT_LNG);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

function extractAddress(body, addressLabels) {
  const labelPattern = new RegExp(`^\\s*(?:${addressLabels.join('|')})\\s*[:：]\\s*`, 'i');
  const paragraphs = [...body.querySelectorAll('p')];
  const labelled = paragraphs.find((p) => labelPattern.test(p.textContent));
  if (labelled) {
    labelled.classList.add('accordion-stores-address');
    return labelled.textContent.replace(labelPattern, '').trim();
  }
  const first = paragraphs.find((p) => p.textContent.trim() && !p.querySelector('a'));
  return first ? first.textContent.trim() : '';
}

function cleanBody(body) {
  // drop phone links with no real number (source data contains tel:null)
  body.querySelectorAll('a[href^="tel:"]').forEach((a) => {
    const number = a.getAttribute('href').slice(4).trim();
    if (!number || number === 'null' || number === 'undefined') {
      const p = a.closest('p');
      if (p && body.contains(p)) p.remove();
      else a.remove();
    }
  });
  body.querySelectorAll('p').forEach((p) => {
    if (!p.textContent.trim() && !p.querySelector('img, picture, a')) p.remove();
  });
}

/** splits plain-text "day: hours" list items so day and hours can be laid out apart */
function formatHours(body) {
  body.querySelectorAll('li').forEach((li) => {
    if (li.children.length) return;
    const match = li.textContent.trim().match(/^([^:：]+)[:：]\s*(.+)$/);
    if (!match) return;
    const day = document.createElement('span');
    day.className = 'accordion-stores-day';
    day.textContent = match[1].trim();
    const hours = document.createElement('span');
    hours.className = 'accordion-stores-hours';
    hours.textContent = match[2].trim();
    li.replaceChildren(day, hours);
  });
}

function mapQuery(store) {
  if (store.coords) return `${store.coords.lat},${store.coords.lng}`;
  return store.address || store.name;
}

function mapEmbedUrl(query, lang) {
  const params = new URLSearchParams({ q: query, output: 'embed', z: '15' });
  if (lang === 'ar') params.set('hl', 'ar');
  return `https://maps.google.com/maps?${params.toString()}`;
}

function directionsUrl(query) {
  const params = new URLSearchParams({ api: '1', destination: query });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function distanceKm(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  instanceCount += 1;
  const uid = `accordion-stores-${instanceCount}`;
  const lang = getLang(block);
  const t = LABELS[lang];

  /* ---------- build store items ---------- */
  const stores = [];
  const listFragment = document.createDocumentFragment();

  [...block.children].forEach((row) => {
    const [labelCell, bodyCell, coordsCell] = row.children;
    const name = labelCell?.textContent.trim();
    if (!name) return;

    const index = stores.length;
    const details = document.createElement('details');
    details.className = 'accordion-stores-item';
    details.name = uid; // exclusive accordion where supported
    details.dataset.index = index;

    const summary = document.createElement('summary');
    summary.className = 'accordion-stores-item-label';
    const nameEl = document.createElement('span');
    nameEl.className = 'accordion-stores-item-name';
    // keep authored numbering; otherwise number by authored order
    nameEl.textContent = LEADING_NUMBER.test(name) ? name : `${index + 1}. ${name}`;
    summary.append(nameEl);

    const body = document.createElement('div');
    body.className = 'accordion-stores-item-body';
    if (bodyCell) body.append(...bodyCell.childNodes);
    cleanBody(body);
    formatHours(body);

    const store = {
      index,
      name: name.replace(LEADING_NUMBER, ''),
      address: extractAddress(body, t.addressLabels),
      coords: parseLatLng(coordsCell),
      details,
    };
    store.search = normalize(`${name} ${store.address} ${body.textContent}`);

    const directions = document.createElement('a');
    directions.className = 'accordion-stores-directions';
    directions.href = directionsUrl(mapQuery(store));
    directions.target = '_blank';
    directions.rel = 'noopener noreferrer';
    directions.textContent = t.directions;
    const directionsWrap = document.createElement('p');
    directionsWrap.append(directions);
    body.append(directionsWrap);

    details.append(summary, body);
    listFragment.append(details);
    stores.push(store);
  });

  /* ---------- panel: toolbar, search, list ---------- */
  const panel = document.createElement('div');
  panel.className = 'accordion-stores-panel';

  const locate = document.createElement('button');
  locate.type = 'button';
  locate.className = 'accordion-stores-locate';
  locate.textContent = t.locate;

  const searchWrap = document.createElement('div');
  searchWrap.className = 'accordion-stores-search';
  const searchLabel = document.createElement('label');
  searchLabel.className = 'accordion-stores-visually-hidden';
  searchLabel.htmlFor = `${uid}-search`;
  searchLabel.textContent = t.search;
  const search = document.createElement('input');
  search.type = 'search';
  search.id = `${uid}-search`;
  search.placeholder = t.searchPlaceholder;
  search.autocomplete = 'off';
  search.setAttribute('aria-controls', `${uid}-list`);
  searchWrap.append(searchLabel, search);

  const status = document.createElement('p');
  status.className = 'accordion-stores-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const list = document.createElement('div');
  list.className = 'accordion-stores-list';
  list.id = `${uid}-list`;
  list.append(listFragment);

  const empty = document.createElement('p');
  empty.className = 'accordion-stores-empty';
  empty.textContent = t.noResults;
  empty.hidden = true;

  panel.append(locate, searchWrap, status, list, empty);

  /* ---------- map panel ---------- */
  const map = document.createElement('div');
  map.className = 'accordion-stores-map';
  const frameHolder = document.createElement('div');
  frameHolder.className = 'accordion-stores-map-frame';
  const mapFooter = document.createElement('div');
  mapFooter.className = 'accordion-stores-map-footer';
  const mapName = document.createElement('p');
  mapName.className = 'accordion-stores-map-name';
  const mapDirections = document.createElement('a');
  mapDirections.className = 'accordion-stores-directions';
  mapDirections.target = '_blank';
  mapDirections.rel = 'noopener noreferrer';
  mapDirections.textContent = t.directions;
  mapDirections.hidden = true;
  mapFooter.append(mapName, mapDirections);
  map.append(frameHolder, mapFooter);

  block.replaceChildren(panel, map);

  /* ---------- map behaviour (iframe created lazily) ---------- */
  let iframe = null;
  let pendingQuery = null;

  const renderMap = (query) => {
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.title = t.mapTitle;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.setAttribute('allowfullscreen', '');
      frameHolder.append(iframe);
    }
    const src = mapEmbedUrl(query, lang);
    if (iframe.src !== src) iframe.src = src;
  };

  let mapVisible = false;
  const showOnMap = (query) => {
    if (mapVisible) renderMap(query);
    else pendingQuery = query;
  };

  const mapObserver = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      mapVisible = true;
      mapObserver.disconnect();
      if (pendingQuery) renderMap(pendingQuery);
    }
  }, { rootMargin: '200px' });
  mapObserver.observe(map);

  let selected = null;
  const selectStore = (store) => {
    if (selected && selected !== store) selected.details.classList.remove('accordion-stores-selected');
    selected = store;
    store.details.classList.add('accordion-stores-selected');
    mapName.textContent = store.name;
    mapDirections.href = directionsUrl(mapQuery(store));
    mapDirections.hidden = false;
    showOnMap(mapQuery(store));
  };

  // single-open accordion + selection; 'toggle' does not bubble so listen in capture phase
  list.addEventListener('toggle', (e) => {
    const details = e.target;
    if (!details.open || !details.classList?.contains('accordion-stores-item')) return;
    list.querySelectorAll('details[open]').forEach((d) => {
      if (d !== details) d.open = false;
    });
    selectStore(stores[Number(details.dataset.index)]);
  }, true);

  if (stores.length) {
    const first = stores[0];
    mapName.textContent = first.name;
    mapDirections.href = directionsUrl(mapQuery(first));
    mapDirections.hidden = false;
    pendingQuery = mapQuery(first);
  }

  /* ---------- search filter ---------- */
  // the result count is announced only; location messages are also shown on screen
  const announce = (text, visible = false) => {
    status.textContent = text;
    status.classList.toggle('accordion-stores-status-visible', visible);
  };
  const updateStatus = (count) => {
    announce(t.results(count, stores.length));
    empty.hidden = count > 0;
  };

  let searchTimer;
  const applyFilter = () => {
    const terms = normalize(search.value).split(' ').filter(Boolean);
    let count = 0;
    stores.forEach((store) => {
      const match = terms.every((term) => store.search.includes(term));
      if (store.details.hidden === match) store.details.hidden = !match;
      if (match) count += 1;
    });
    updateStatus(count);
  };
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilter, 120);
  });
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(searchTimer);
      applyFilter();
      const firstVisible = stores.find((s) => !s.details.hidden);
      if (firstVisible) {
        firstVisible.details.open = true;
        firstVisible.details.querySelector('summary').focus();
      }
    }
  });
  updateStatus(stores.length);

  /* ---------- use my location ---------- */
  const setBusy = (busy) => {
    locate.disabled = busy;
    locate.setAttribute('aria-busy', busy);
    locate.textContent = busy ? t.locating : t.locate;
  };

  locate.addEventListener('click', () => {
    if (!navigator.geolocation) {
      announce(t.geoUnsupported, true);
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      setBusy(false);
      const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const located = stores.filter((s) => s.coords);

      if (!located.length) {
        // no store coordinates authored: show the user's position on the map
        mapName.textContent = '';
        mapDirections.hidden = true;
        showOnMap(`${here.lat},${here.lng}`);
        announce(t.yourLocation, true);
        return;
      }

      // sort stores by distance (stores without coordinates go last)
      const sorted = [...stores].sort((a, b) => {
        const da = a.coords ? distanceKm(here, a.coords) : Infinity;
        const db = b.coords ? distanceKm(here, b.coords) : Infinity;
        return da - db;
      });
      const fragment = document.createDocumentFragment();
      sorted.forEach((s) => fragment.append(s.details));
      list.append(fragment);
      list.scrollTop = 0;

      search.value = '';
      applyFilter();
      const [nearest] = sorted;
      nearest.details.open = true;
      selectStore(nearest);
      announce(t.nearest(nearest.name), true);
    }, () => {
      setBusy(false);
      announce(t.geoDenied, true);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  });
}
