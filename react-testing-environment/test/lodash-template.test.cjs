const assert = require('node:assert/strict');
const { test } = require('node:test');

// Exercise the installations used by HTML and service-worker generation.
const lodash = require(require.resolve('lodash', {
  paths: [require.resolve('html-webpack-plugin')]
}));
const workboxTemplate = require(require.resolve('lodash.template', {
  paths: [require.resolve('workbox-build')]
}));

for (const [name, template] of [
  ['HTML plugin Lodash', lodash.template],
  ['Workbox lodash.template', workboxTemplate]
]) {
  test(name + ' rejects import names that execute default parameters', () => {
    let executed = false;
    const imports = {
      probe: () => { executed = true; },
      'value = probe()': undefined
    };
    assert.throws(() => template('hello', { imports }), /Invalid.*imports/);
    assert.equal(executed, false);
  });

  test(name + ' ignores inherited import names', () => {
    let executed = false;
    const imports = Object.create({ 'value = probe()': undefined });
    imports.probe = () => { executed = true; };
    assert.equal(template('hello', { imports })({}), 'hello');
    assert.equal(executed, false);
  });

  test(name + ' preserves interpolation, escaping and static imports', () => {
    const render = template('<%= format(name) %>: <%- value %>', {
      imports: { format: name => name.toUpperCase() }
    });
    assert.equal(render({ name: 'world', value: '<script>' }), 'WORLD: &lt;script&gt;');
  });
}
