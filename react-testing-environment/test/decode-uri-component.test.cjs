const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const sourceMapResolve = require('source-map-resolve');
const decoderPath = require.resolve('decode-uri-component', {
  paths: [require.resolve('source-map-resolve')]
});
const decode = require(decoderPath);

test('the CommonJS consumer retains URI decoding behavior', () => {
  for (const [encoded, decoded] of [
    ['hello%20world', 'hello world'],
    ['%C3%A5%F0%9F%98%80', 'å😀'],
    ['%2520%zz', '%20%zz'],
    ['%FE%FF%C2%zz', '\uFFFD\uFFFD\uFFFD%zz'],
    ['trailing%', 'trailing%']
  ]) {
    assert.equal(decode(encoded), decoded);
  }
  assert.throws(() => decode(null), TypeError);
});

test('source-map-resolve reads encoded map and source paths synchronously', () => {
  const map = { version: 3, sources: ['input%20%C3%A5+%zz.js'], names: [], mappings: '' };
  const reads = [];
  const read = filename => {
    reads.push(filename);
    return filename.endsWith('.map') ? JSON.stringify(map) : 'original source';
  };
  const result = sourceMapResolve.resolveSync(
    '//# sourceMappingURL=output%20%C3%A5+%zz.js.map', '/project/output.js', read
  );
  assert.deepEqual(reads, ['/project/output å+%zz.js.map', '/project/input å+%zz.js']);
  assert.deepEqual(result.sourcesContent, ['original source']);
});

test('many distinct malformed percent-encoded runs do not stall map resolution', () => {
  // Keep the event-loop regression in a child so a vulnerable decoder is killed
  // rather than blocking the test runner. The advisory's 224 KB input takes
  // about 20 seconds with the quadratic replacement loop.
  const result = spawnSync(process.execPath, ['-e', `
    const assert = require('node:assert/strict');
    const resolve = require(${JSON.stringify(require.resolve('source-map-resolve'))});
    let payload = '';
    for (let i = 0; i < 32000; i++) {
      payload += '%' + (i >> 8).toString(16).padStart(2, '0') +
        '%' + (i % 256).toString(16).padStart(2, '0') + 'x';
    }
    payload += '%zz';
    let reads = 0;
    const result = resolve.resolveSourceMapSync(
      '//# sourceMappingURL=' + payload, '/project/output.js', filename => {
        reads++;
        assert.ok(filename.endsWith('%zz'));
        return JSON.stringify({ version: 3, sources: [], names: [], mappings: '' });
      }
    );
    assert.equal(reads, 1);
    assert.equal(result.map.version, 3);
  `], { timeout: 5000, encoding: 'utf8' });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
});
