const assert = require('node:assert/strict');
const { test } = require('node:test');

const http = require('http');

// Exercise the jsdom used by SVG tooling, which previously pulled in request's
// vulnerable form-data copy independently of Jest's newer jsdom.
const { JSDOM } = require(require.resolve('jsdom', {
  paths: [require.resolve('h2x-parse')]
}));

test('keeps multipart boundaries unpredictable when Math.random is predictable', async () => {
  const guessedBoundary = '--------------------------' + '0'.repeat(24);
  const payload = 'value\r\n--' + guessedBoundary +
    '\r\nContent-Disposition: form-data; name="injected"\r\n\r\ntrue';
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      requests.push({ contentType: req.headers['content-type'], body });
      res.end('ok');
    });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const dom = new JSDOM('', {
    url: 'http://127.0.0.1:' + server.address().port
  });
  const random = Math.random;
  Math.random = () => 0;
  try {
    for (let i = 0; i < 2; i++) {
      await new Promise((resolve, reject) => {
        const form = new dom.window.FormData();
        form.append('value', payload);
        const xhr = new dom.window.XMLHttpRequest();
        xhr.open('POST', '/');
        xhr.onload = () => {
          if (xhr.status === 200) resolve();
          else reject(new Error('Unexpected status: ' + xhr.status));
        };
        xhr.onerror = () => reject(new Error('Multipart upload failed'));
        xhr.send(form);
      });
    }

    assert.equal(requests.length, 2);
    const boundaries = requests.map(({ contentType, body }) => {
      const boundary = contentType.match(/boundary=(.+)$/)[1];
      assert.notEqual(boundary, guessedBoundary);
      assert.ok(body.includes(payload));
      assert.ok(body.includes('--' + boundary + '--'));
      return boundary;
    });
    assert.notEqual(boundaries[0], boundaries[1]);
  } finally {
    Math.random = random;
    dom.window.close();
    await new Promise(resolve => server.close(resolve));
  }
});

test('still converts SVG through the updated jsdom dependency', async () => {
  const convert = require('@svgr/core').default;
  const jsx = await convert(
    '<svg viewBox="0 0 10 10"><path stroke-width="2" d="M0 0h10"/></svg>',
    { svgo: false },
    { componentName: 'TestIcon' }
  );
  assert.ok(jsx.includes('const TestIcon'));
  assert.ok(jsx.includes('viewBox="0 0 10 10"'));
  assert.ok(jsx.includes('strokeWidth={2}'));
  assert.ok(jsx.includes('export default TestIcon'));
});
