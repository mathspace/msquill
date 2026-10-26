const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const postcss = require('postcss');

test('CSS annotations cannot read non-map files or leak their contents', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'msquill-postcss-'));
  try {
    const secret = path.join(dir, 'secret.txt');
    fs.writeFileSync(secret, 'PRIVATE_SENTINEL_NOT_JSON');
    for (const [annotation, options] of [
      [secret, {}],
      ['../secret.txt', { from: path.join(dir, 'styles', 'input.css') }]
    ]) {
      const css = 'a { color: red }\n/*# sourceMappingURL=' + annotation + ' */';
      // Vulnerable versions try to parse the secret as JSON and throw an error
      // that includes its contents. Patched PostCSS ignores this annotation.
      const result = postcss().process(css, options).sync();
      assert.equal(result.root.first.selector, 'a');
      assert.equal(result.root.source.input.map, undefined);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('ordinary inline source maps still preserve original CSS locations', () => {
  const map = {
    version: 3,
    sources: ['original.css'],
    names: [],
    mappings: 'AAAA',
    sourcesContent: ['a { color: red }']
  };
  const css = 'a { color: red }\n/*# sourceMappingURL=data:application/json;base64,' +
    Buffer.from(JSON.stringify(map)).toString('base64') + ' */';
  const result = postcss().process(css, { from: 'compiled.css' }).sync();
  assert.deepEqual(result.root.source.input.map.consumer().sources, ['original.css']);
});
