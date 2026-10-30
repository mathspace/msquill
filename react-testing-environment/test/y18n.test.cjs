const assert = require('node:assert/strict');
const { test } = require('node:test');

// Exercise the y18n installations resolved by both CLI toolchains.
for (const consumer of ['webpack-dev-server', 'jest-cli']) {
  const yargs = require.resolve('yargs', {
    paths: [require.resolve(consumer)]
  });
  const y18n = require(require.resolve('y18n', { paths: [yargs] }));

  test(consumer + ' locale updates cannot pollute Object.prototype', () => {
    const locale = y18n({ locale: '__proto__', updateFiles: false });
    try {
      locale.updateLocale({ msquillY18nPolluted: true });
      assert.equal(Object.prototype.msquillY18nPolluted, undefined);
      assert.equal({}.msquillY18nPolluted, undefined);
    } finally {
      delete Object.prototype.msquillY18nPolluted;
    }
  });

  test(consumer + ' preserves translations, interpolation and plurals', () => {
    const locale = y18n({ updateFiles: false });
    locale.updateLocale({
      'Hello %s': 'Welcome %s',
      '%d item': { one: '%d entry', other: '%d entries' }
    });
    assert.equal(locale.__('Hello %s', 'world'), 'Welcome world');
    assert.equal(locale.__n('%d item', '%d items', 1), '1 entry');
    assert.equal(locale.__n('%d item', '%d items', 2), '2 entries');
  });
}
