import { createGroceryDemoServices } from '../../scripts/demo/grocery-services.js';

const COPY = {
  en: {
    demo: 'Demonstration mode · representative data',
    greeting: 'Welcome back, {name}',
    tier: '{tier} · {points} points',
    headline: 'Your neighbourhood shop, ready when you are',
    intro: 'Fresh food, weekly value and familiar favourites for delivery across the UAE.',
    search: 'Search groceries',
    searchHint: 'Try milk, dates or موز',
    all: 'All',
    buyAgain: 'Buy Again',
    produce: 'Fresh produce',
    dairy: 'Dairy & eggs',
    bakery: 'Bakery',
    meat: 'Meat & seafood',
    pantry: 'Pantry',
    drinks: 'Drinks',
    results: '{count} products',
    add: 'Add',
    unavailable: 'Unavailable',
    substitutes: 'See substitutes',
    choose: 'Choose',
    noResults: 'No representative products match this search.',
    memberPrice: 'Member',
    estimatedWeight: 'Final price depends on packed weight',
    basket: 'Your basket',
    emptyBasket: 'Add a few favourites to start your shop.',
    quantity: 'Quantity',
    remove: 'Remove',
    subtotal: 'Estimated subtotal',
    savings: 'Member savings',
    delivery: 'Delivery',
    total: 'Estimated total',
    slotHeading: 'Choose a delivery window',
    limited: 'Limited',
    available: 'Available',
    free: 'Free',
    substitutionPreference: 'If unavailable',
    bestMatch: 'Best available match',
    contactMe: 'Contact me',
    noSubstitute: 'Do not substitute',
    review: 'Review demo order',
    reviewHeading: 'Review your delivery',
    reviewIntro: 'Prices for weighted items are estimates until picking. No payment is collected in this demonstration.',
    editBasket: 'Edit basket',
    address: 'Delivery address',
    addressValue: 'Al Khalidiyah, Abu Dhabi · Representative address',
    payment: 'Payment',
    paymentValue: 'Not connected · payment settlement requires an approved provider',
    placeOrder: 'Simulate order placement',
    checking: 'Revalidating basket and delivery capacity…',
    weightedNote: 'Weighted items will be repriced from the final picked weight.',
    confirmation: 'Demo order confirmed',
    orderNumber: 'Representative order {number}',
    confirmationIntro: 'This confirmation demonstrates the customer experience only. It was not sent to an OMS and no payment was taken.',
    editOrder: 'Edit this demo order',
    orderEdit: 'Order edit concept',
    orderEditIntro: 'Changes are revalidated against price, stock and delivery capacity before an OMS update would be requested.',
    revalidate: 'Revalidate changes',
    valid: 'Demo checks passed at {time}. Production requires OMS inventory, loyalty, capacity and payment integrations.',
    continueShopping: 'Continue shopping',
    recommended: 'Recommended substitutes',
    substituteIntro: 'Recommendations are representative. A production service must supply availability and equivalence rules.',
    close: 'Close',
    serviceError: 'The representative grocery service could not be loaded.',
  },
  ar: {
    demo: 'وضع تجريبي · بيانات تمثيلية',
    greeting: 'مرحباً بعودتك، {name}',
    tier: '{tier} · {points} نقطة',
    headline: 'متجرك القريب، جاهز عندما تكون جاهزاً',
    intro: 'منتجات طازجة وقيمة أسبوعية ومفضلاتك للتوصيل في الإمارات.',
    search: 'ابحث عن البقالة',
    searchHint: 'جرب الحليب أو التمر أو bananas',
    all: 'الكل',
    buyAgain: 'اشترِ مجدداً',
    produce: 'خضار وفواكه',
    dairy: 'ألبان وبيض',
    bakery: 'مخبوزات',
    meat: 'لحوم وأسماك',
    pantry: 'مواد غذائية',
    drinks: 'مشروبات',
    results: '{count} منتج',
    add: 'أضف',
    unavailable: 'غير متوفر',
    substitutes: 'عرض البدائل',
    choose: 'اختر',
    noResults: 'لا توجد منتجات تمثيلية تطابق البحث.',
    memberPrice: 'للأعضاء',
    estimatedWeight: 'السعر النهائي يعتمد على الوزن المعبأ',
    basket: 'سلتك',
    emptyBasket: 'أضف بعض مفضلاتك لبدء التسوق.',
    quantity: 'الكمية',
    remove: 'إزالة',
    subtotal: 'المجموع التقديري',
    savings: 'توفير الأعضاء',
    delivery: 'التوصيل',
    total: 'الإجمالي التقديري',
    slotHeading: 'اختر موعد التوصيل',
    limited: 'محدود',
    available: 'متاح',
    free: 'مجاني',
    substitutionPreference: 'إذا لم يتوفر',
    bestMatch: 'أفضل بديل متاح',
    contactMe: 'تواصل معي',
    noSubstitute: 'بدون بديل',
    review: 'راجع الطلب التجريبي',
    reviewHeading: 'راجع طلب التوصيل',
    reviewIntro: 'أسعار المنتجات الموزونة تقديرية حتى التجهيز. لن يتم تحصيل أي دفعة في هذا العرض.',
    editBasket: 'تعديل السلة',
    address: 'عنوان التوصيل',
    addressValue: 'الخالدية، أبوظبي · عنوان تمثيلي',
    payment: 'الدفع',
    paymentValue: 'غير متصل · يتطلب مزود دفع معتمداً',
    placeOrder: 'محاكاة إرسال الطلب',
    checking: 'جارٍ إعادة التحقق من السلة وسعة التوصيل…',
    weightedNote: 'سيعاد تسعير المنتجات الموزونة حسب الوزن النهائي.',
    confirmation: 'تم تأكيد الطلب التجريبي',
    orderNumber: 'طلب تمثيلي {number}',
    confirmationIntro: 'هذا التأكيد يوضح تجربة العميل فقط. لم يُرسل إلى نظام إدارة الطلبات ولم يتم الدفع.',
    editOrder: 'تعديل هذا الطلب التجريبي',
    orderEdit: 'مفهوم تعديل الطلب',
    orderEditIntro: 'يجب إعادة التحقق من السعر والمخزون وسعة التوصيل قبل طلب التحديث من نظام إدارة الطلبات.',
    revalidate: 'إعادة التحقق',
    valid: 'نجحت الفحوص التجريبية في {time}. يتطلب الإنتاج تكامل المخزون والولاء والسعة والدفع.',
    continueShopping: 'متابعة التسوق',
    recommended: 'بدائل مقترحة',
    substituteIntro: 'الاقتراحات تمثيلية. يجب أن توفر خدمة الإنتاج قواعد التوفر والتكافؤ.',
    close: 'إغلاق',
    serviceError: 'تعذر تحميل خدمة البقالة التمثيلية.',
  },
};

const CATEGORIES = ['all', 'produce', 'dairy', 'bakery', 'meat', 'pantry', 'drinks'];

function format(template, values) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, value),
    template,
  );
}

function currency(value, locale) {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
  }).format(value);
}

function readLocale() {
  try {
    return localStorage.getItem('adcoop-demo-locale') === 'ar' ? 'ar' : 'en';
  } catch (error) {
    return 'en';
  }
}

export default async function decorate(block) {
  const state = {
    locale: readLocale(),
    category: 'all',
    phrase: '',
    buyAgain: false,
    cart: [],
    slot: null,
    view: 'shop',
    substituteFor: null,
    revalidation: null,
    orderNumber: null,
  };

  let services;
  try {
    services = await createGroceryDemoServices();
  } catch (error) {
    console.error('Unable to initialize grocery demonstration', error);
    block.textContent = COPY[state.locale].serviceError;
    return;
  }

  const profile = services.loyalty.getProfile();
  const t = (key) => COPY[state.locale][key];
  const localized = (value) => value?.[state.locale] || value?.en || '';

  function setDocumentLanguage() {
    document.documentElement.lang = state.locale;
    document.documentElement.dir = state.locale === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('adcoop-demo-locale', state.locale);
    } catch (error) {
      // Language preference remains active for this page view.
    }
  }

  function getItemTotal(item) {
    return services.loyalty.getPrice(item.product) * item.quantity;
  }

  function getTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + getItemTotal(item), 0);
    const regularSubtotal = state.cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const delivery = state.slot?.fee || 0;
    return {
      subtotal,
      delivery,
      savings: regularSubtotal - subtotal,
      total: subtotal + delivery,
    };
  }

  function addProduct(product, quantity = null) {
    if (product.outOfStock) {
      state.substituteFor = product.sku;
      render();
      return;
    }
    const existing = state.cart.find((item) => item.product.sku === product.sku);
    const amount = quantity ?? product.step;
    if (existing) {
      existing.quantity += amount;
    } else {
      state.cart.push({
        product,
        quantity: amount,
        substitution: 'bestMatch',
      });
    }
    state.substituteFor = null;
    render();
  }

  function updateQuantity(sku, direction) {
    const item = state.cart.find((entry) => entry.product.sku === sku);
    if (!item) return;
    item.quantity = Number((item.quantity + (item.product.step * direction)).toFixed(2));
    if (item.quantity <= 0) {
      state.cart = state.cart.filter((entry) => entry.product.sku !== sku);
    }
    render();
  }

  function productCard(product, action = 'add') {
    const price = services.loyalty.getPrice(product);
    const originalPrice = product.price !== price
      ? `<span class="grocery-demo__regular-price">${currency(product.price, state.locale)}</span>`
      : '';
    const quantity = product.weighted ? `${product.step} ${localized({ en: 'kg', ar: 'كغ' })}` : '';
    let buttonLabel = t('add');
    if (product.outOfStock) buttonLabel = t('substitutes');
    else if (action === 'choose') buttonLabel = t('choose');
    const buttonClass = product.outOfStock ? 'secondary' : 'primary';
    return `
      <article class="grocery-demo__product ${product.outOfStock ? 'is-unavailable' : ''}" data-sku="${product.sku}">
        <div class="grocery-demo__product-art" role="img" aria-label="${localized(product.name)}">${product.emoji}</div>
        <div class="grocery-demo__product-details">
          ${product.promotion ? `<span class="grocery-demo__promotion">${localized(product.promotion)}</span>` : ''}
          <h3>${localized(product.name)}</h3>
          <p class="grocery-demo__unit">${product.unit}</p>
          ${product.outOfStock ? `<p class="grocery-demo__unavailable">${t('unavailable')}</p>` : `
            <p class="grocery-demo__price">
              <strong>${currency(price, state.locale)}</strong>
              ${originalPrice}
              <span>${t('memberPrice')}</span>
            </p>
            ${product.weighted ? `<p class="grocery-demo__weight-note">${t('estimatedWeight')}</p>` : ''}
          `}
        </div>
        <button class="${buttonClass}" type="button" data-action="${product.outOfStock ? 'substitutes' : 'add'}" data-sku="${product.sku}">
          ${buttonLabel}${quantity ? ` · ${quantity}` : ''}
        </button>
      </article>
    `;
  }

  function renderSubstitutes() {
    if (!state.substituteFor) return '';
    const product = services.catalog.get(state.substituteFor);
    const recommendations = services.substitutions.getRecommendations(product);
    return `
      <section class="grocery-demo__substitutes" aria-labelledby="substitute-title">
        <button class="grocery-demo__close" type="button" data-action="close-substitutes" aria-label="${t('close')}">×</button>
        <p class="grocery-demo__eyebrow">${t('unavailable')}: ${localized(product.name)}</p>
        <h2 id="substitute-title">${t('recommended')}</h2>
        <p>${t('substituteIntro')}</p>
        <div class="grocery-demo__substitute-grid">
          ${recommendations.map((recommendation) => productCard(recommendation, 'choose')).join('')}
        </div>
      </section>
    `;
  }

  function renderCart() {
    const totals = getTotals();
    const items = state.cart.length
      ? state.cart.map((item) => `
        <li class="grocery-demo__cart-item">
          <span class="grocery-demo__cart-emoji" aria-hidden="true">${item.product.emoji}</span>
          <div>
            <strong>${localized(item.product.name)}</strong>
            <span>${currency(getItemTotal(item), state.locale)}</span>
            <div class="grocery-demo__quantity" aria-label="${t('quantity')}">
              <button type="button" data-action="quantity" data-direction="-1" data-sku="${item.product.sku}" aria-label="${t('remove')} ${localized(item.product.name)}">−</button>
              <output>${item.quantity} ${item.product.weighted ? localized({ en: 'kg', ar: 'كغ' }) : ''}</output>
              <button type="button" data-action="quantity" data-direction="1" data-sku="${item.product.sku}" aria-label="${t('add')} ${localized(item.product.name)}">+</button>
            </div>
            <label>
              <span>${t('substitutionPreference')}</span>
              <select data-action="preference" data-sku="${item.product.sku}">
                <option value="bestMatch" ${item.substitution === 'bestMatch' ? 'selected' : ''}>${t('bestMatch')}</option>
                <option value="contactMe" ${item.substitution === 'contactMe' ? 'selected' : ''}>${t('contactMe')}</option>
                <option value="noSubstitute" ${item.substitution === 'noSubstitute' ? 'selected' : ''}>${t('noSubstitute')}</option>
              </select>
            </label>
          </div>
        </li>
      `).join('')
      : `<li class="grocery-demo__empty">${t('emptyBasket')}</li>`;

    return `
      <aside class="grocery-demo__basket" aria-labelledby="basket-title">
        <h2 id="basket-title">${t('basket')} <span>${state.cart.length}</span></h2>
        <ul>${items}</ul>
        <fieldset class="grocery-demo__slots" ${state.cart.length ? '' : 'disabled'}>
          <legend>${t('slotHeading')}</legend>
          ${services.deliveryCapacity.listSlots().map((slot) => `
            <label>
              <input type="radio" name="delivery-slot" value="${slot.id}" ${state.slot?.id === slot.id ? 'checked' : ''}>
              <span>
                <strong>${localized(slot.day)} · ${slot.time}</strong>
                <small>${t(slot.capacity)} · ${slot.fee ? currency(slot.fee, state.locale) : t('free')}</small>
              </span>
            </label>
          `).join('')}
        </fieldset>
        <dl class="grocery-demo__totals">
          <div><dt>${t('subtotal')}</dt><dd>${currency(totals.subtotal, state.locale)}</dd></div>
          <div class="savings"><dt>${t('savings')}</dt><dd>−${currency(totals.savings, state.locale)}</dd></div>
          <div><dt>${t('delivery')}</dt><dd>${totals.delivery ? currency(totals.delivery, state.locale) : t('free')}</dd></div>
          <div class="total"><dt>${t('total')}</dt><dd>${currency(totals.total, state.locale)}</dd></div>
        </dl>
        <button class="accent grocery-demo__review" type="button" data-action="review" ${state.cart.length && state.slot ? '' : 'disabled'}>
          ${t('review')}
        </button>
      </aside>
    `;
  }

  function renderShop() {
    const products = services.catalog.search({
      phrase: state.phrase,
      category: state.category,
      buyAgain: state.buyAgain,
    });
    return `
      <section class="grocery-demo__hero">
        <div>
          <p class="grocery-demo__eyebrow">${format(t('greeting'), { name: localized(profile.firstName) })}</p>
          <h1>${t('headline')}</h1>
          <p>${t('intro')}</p>
          <p class="grocery-demo__member">${format(t('tier'), { tier: localized(profile.tier), points: profile.points.toLocaleString(state.locale === 'ar' ? 'ar-AE' : 'en-AE') })}</p>
        </div>
        <div class="grocery-demo__hero-mark" aria-hidden="true"><span>A</span><b>fresh</b></div>
      </section>
      <div class="grocery-demo__toolbar">
        <label class="grocery-demo__search">
          <span class="sr-only">${t('search')}</span>
          <input type="search" value="${state.phrase}" placeholder="${t('searchHint')}" data-action="search">
        </label>
        <button type="button" class="${state.buyAgain ? 'primary' : 'secondary'}" data-action="buy-again">${t('buyAgain')}</button>
      </div>
      <nav class="grocery-demo__categories" aria-label="${t('all')}">
        ${CATEGORIES.map((category) => `
          <button type="button" data-action="category" data-category="${category}" aria-pressed="${state.category === category}">
            ${t(category)}
          </button>
        `).join('')}
      </nav>
      ${renderSubstitutes()}
      <div class="grocery-demo__shopping-layout">
        <section class="grocery-demo__catalog" aria-labelledby="results-heading">
          <div class="grocery-demo__results-heading">
            <h2 id="results-heading">${state.buyAgain ? t('buyAgain') : t(state.category)}</h2>
            <span aria-live="polite">${format(t('results'), { count: products.length })}</span>
          </div>
          <div class="grocery-demo__products">
            ${products.length ? products.map((product) => productCard(product)).join('') : `<p>${t('noResults')}</p>`}
          </div>
        </section>
        ${renderCart()}
      </div>
    `;
  }

  function renderReview() {
    const totals = getTotals();
    return `
      <section class="grocery-demo__flow-card">
        <p class="grocery-demo__eyebrow">${t('demo')}</p>
        <h1>${t('reviewHeading')}</h1>
        <p>${t('reviewIntro')}</p>
        <div class="grocery-demo__review-grid">
          <div>
            <section class="grocery-demo__summary-card">
              <h2>${t('basket')}</h2>
              <ul>
                ${state.cart.map((item) => `<li><span>${item.quantity} ${item.product.weighted ? localized({ en: 'kg', ar: 'كغ' }) : '×'} ${localized(item.product.name)}</span><strong>${currency(getItemTotal(item), state.locale)}</strong></li>`).join('')}
              </ul>
              <button class="secondary" type="button" data-action="shop">${t('editBasket')}</button>
            </section>
            <section class="grocery-demo__summary-card">
              <h2>${t('address')}</h2>
              <p>${t('addressValue')}</p>
              <h2>${t('payment')}</h2>
              <p class="grocery-demo__integration-note">${t('paymentValue')}</p>
            </section>
          </div>
          <aside class="grocery-demo__summary-card">
            <h2>${t('slotHeading')}</h2>
            <p><strong>${localized(state.slot.day)} · ${state.slot.time}</strong></p>
            <dl class="grocery-demo__totals">
              <div><dt>${t('subtotal')}</dt><dd>${currency(totals.subtotal, state.locale)}</dd></div>
              <div><dt>${t('delivery')}</dt><dd>${totals.delivery ? currency(totals.delivery, state.locale) : t('free')}</dd></div>
              <div class="total"><dt>${t('total')}</dt><dd>${currency(totals.total, state.locale)}</dd></div>
            </dl>
            <p class="grocery-demo__weight-note">${t('weightedNote')}</p>
            <button class="accent" type="button" data-action="place-order">${t('placeOrder')}</button>
            <p class="grocery-demo__checking" role="status" aria-live="polite"></p>
          </aside>
        </div>
      </section>
    `;
  }

  function renderConfirmation() {
    return `
      <section class="grocery-demo__flow-card grocery-demo__confirmation">
        <div class="grocery-demo__success" aria-hidden="true">✓</div>
        <p class="grocery-demo__eyebrow">${t('demo')}</p>
        <h1>${t('confirmation')}</h1>
        <h2>${format(t('orderNumber'), { number: state.orderNumber })}</h2>
        <p>${t('confirmationIntro')}</p>
        <div class="grocery-demo__order-edit">
          <h2>${t('orderEdit')}</h2>
          <p>${t('orderEditIntro')}</p>
          <button class="primary" type="button" data-action="revalidate">${t('revalidate')}</button>
          <button class="secondary" type="button" data-action="review">${t('editOrder')}</button>
          <p role="status" aria-live="polite">${state.revalidation || ''}</p>
        </div>
        <button class="secondary" type="button" data-action="reset">${t('continueShopping')}</button>
      </section>
    `;
  }

  function render() {
    setDocumentLanguage();
    block.innerHTML = `
      <div class="grocery-demo__topbar">
        <span>${t('demo')}</span>
        <button type="button" data-action="language" lang="${state.locale === 'en' ? 'ar' : 'en'}">
          ${state.locale === 'en' ? 'العربية' : 'English'}
        </button>
      </div>
      ${state.view === 'shop' ? renderShop() : ''}
      ${state.view === 'review' ? renderReview() : ''}
      ${state.view === 'confirmation' ? renderConfirmation() : ''}
    `;
  }

  block.addEventListener('input', (event) => {
    if (event.target.dataset.action !== 'search') return;
    state.phrase = event.target.value;
    const cursorPosition = event.target.selectionStart;
    render();
    const search = block.querySelector('[data-action="search"]');
    search.focus();
    search.setSelectionRange(cursorPosition, cursorPosition);
  });

  block.addEventListener('change', (event) => {
    if (event.target.name === 'delivery-slot') {
      state.slot = services.deliveryCapacity.reserve(event.target.value);
      render();
    }
    if (event.target.dataset.action === 'preference') {
      const item = state.cart.find(({ product }) => product.sku === event.target.dataset.sku);
      if (item) item.substitution = event.target.value;
    }
  });

  block.addEventListener('click', async (event) => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;
    const { action, sku } = trigger.dataset;

    if (action === 'language') {
      state.locale = state.locale === 'en' ? 'ar' : 'en';
      render();
    } else if (action === 'category') {
      state.category = trigger.dataset.category;
      state.buyAgain = false;
      render();
    } else if (action === 'buy-again') {
      state.buyAgain = !state.buyAgain;
      state.category = 'all';
      render();
    } else if (action === 'add') {
      addProduct(services.catalog.get(sku));
    } else if (action === 'substitutes') {
      state.substituteFor = sku;
      render();
      block.querySelector('.grocery-demo__substitutes')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'close-substitutes') {
      state.substituteFor = null;
      render();
    } else if (action === 'quantity') {
      updateQuantity(sku, Number(trigger.dataset.direction));
    } else if (action === 'review') {
      if (state.cart.length && state.slot) {
        state.view = 'review';
        render();
        block.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action === 'shop') {
      state.view = 'shop';
      render();
    } else if (action === 'place-order') {
      const status = block.querySelector('.grocery-demo__checking');
      status.textContent = t('checking');
      trigger.disabled = true;
      const result = await services.checkout.revalidate(state.cart, state.slot);
      if (result.valid) {
        state.orderNumber = services.checkout.placeRepresentativeOrder();
        state.view = 'confirmation';
        render();
        block.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action === 'revalidate') {
      trigger.disabled = true;
      trigger.textContent = t('checking');
      const result = await services.checkout.revalidate(state.cart, state.slot);
      const time = new Intl.DateTimeFormat(state.locale === 'ar' ? 'ar-AE' : 'en-AE', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(result.checkedAt));
      state.revalidation = format(t('valid'), { time });
      render();
    } else if (action === 'reset') {
      state.view = 'shop';
      state.revalidation = null;
      render();
    }
  });

  render();
}
