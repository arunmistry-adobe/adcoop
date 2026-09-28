const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const fixture = JSON.parse(readFileSync(
  join(__dirname, '..', 'scripts', 'demo', 'grocery-products.json'),
  'utf8',
));

test('representative catalog has unique bilingual grocery products', () => {
  const visibleProducts = fixture.products.filter(({ substituteOnly }) => !substituteOnly);
  const skus = new Set(fixture.products.map(({ sku }) => sku));

  assert.ok(visibleProducts.length >= 20);
  assert.equal(skus.size, fixture.products.length);
  fixture.products.forEach((product) => {
    assert.match(product.sku, /^DEMO-PROD-\d{3}$/);
    assert.ok(product.name.en);
    assert.ok(product.name.ar);
    assert.ok(product.price > 0);
    assert.ok(product.memberPrice <= product.price);
  });
});

test('weighted products use fractional increments and disclose kilogram units', () => {
  const weighted = fixture.products.filter(({ weighted }) => weighted);

  assert.ok(weighted.length >= 5);
  weighted.forEach((product) => {
    assert.equal(product.unit, 'kg');
    assert.ok(product.step > 0 && product.step < 1);
  });
});

test('unavailable products resolve to valid substitute recommendations', () => {
  const productsBySku = new Map(fixture.products.map((product) => [product.sku, product]));
  const unavailable = fixture.products.filter(({ outOfStock }) => outOfStock);

  assert.ok(unavailable.length > 0);
  unavailable.forEach((product) => {
    assert.ok(product.substitutes.length > 0);
    product.substitutes.forEach((sku) => {
      const substitute = productsBySku.get(sku);
      assert.ok(substitute);
      assert.equal(substitute.outOfStock, undefined);
    });
  });
});

test('delivery slots expose bilingual labels, fees, and capacity state', () => {
  assert.ok(fixture.deliverySlots.length >= 3);
  fixture.deliverySlots.forEach((slot) => {
    assert.ok(slot.day.en);
    assert.ok(slot.day.ar);
    assert.ok(slot.fee >= 0);
    assert.ok(['available', 'limited'].includes(slot.capacity));
  });
});
