/**
 * Demo-only service boundaries for grocery capabilities not connected to ACCS.
 * Replace individual adapters with production integrations without changing the block UI contract.
 */
export async function createGroceryDemoServices() {
  const response = await fetch('/scripts/demo/grocery-products.json');
  if (!response.ok) {
    throw new Error(`Unable to load representative grocery data (${response.status})`);
  }

  const data = await response.json();
  const bySku = new Map(data.products.map((product) => [product.sku, product]));

  return {
    catalog: {
      search({ phrase = '', category = 'all', buyAgain = false }) {
        const query = phrase.trim().toLocaleLowerCase();
        return data.products.filter((product) => {
          if (product.substituteOnly) return false;
          const categoryMatch = category === 'all' || product.category === category;
          const historyMatch = !buyAgain || product.buyAgain;
          const searchMatch = !query
            || Object.values(product.name).some((name) => name.toLocaleLowerCase().includes(query));
          return categoryMatch && historyMatch && searchMatch;
        });
      },
      get(sku) {
        return bySku.get(sku);
      },
    },
    loyalty: {
      getProfile() {
        return {
          firstName: { en: 'Mariam', ar: 'مريم' },
          points: 2840,
          tier: { en: 'Gold member', ar: 'عضو ذهبي' },
        };
      },
      getPrice(product) {
        return product.memberPrice ?? product.price;
      },
    },
    substitutions: {
      getRecommendations(product) {
        return (product.substitutes || []).map((sku) => bySku.get(sku)).filter(Boolean);
      },
    },
    deliveryCapacity: {
      listSlots() {
        return data.deliverySlots;
      },
      reserve(slotId) {
        return data.deliverySlots.find((slot) => slot.id === slotId) || null;
      },
    },
    checkout: {
      async revalidate(cart, slot) {
        await new Promise((resolve) => { window.setTimeout(resolve, 450); });
        return {
          valid: cart.length > 0 && Boolean(slot),
          checkedAt: new Date().toISOString(),
          messages: cart.some(({ product }) => product.weighted)
            ? ['weighted-total']
            : [],
        };
      },
      placeRepresentativeOrder() {
        return `DEMO-${Math.floor(100000 + Math.random() * 900000)}`;
      },
    },
  };
}
