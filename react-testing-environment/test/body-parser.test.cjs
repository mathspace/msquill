const assert = require('node:assert/strict');
const http = require('node:http');
const { test } = require('node:test');
const { deflateSync, gzipSync } = require('node:zlib');

// Resolve Express through webpack-dev-server, so these checks exercise the
// transitive parser used by the debugging toolchain.
const express = require(require.resolve('express', {
  paths: [require.resolve('webpack-dev-server')]
}));

async function startServer(t) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.post('/', (req, res) => res.json(req.body));
  app.get('/health', (req, res) => res.end('ok'));
  app.use((err, req, res, next) => res.sendStatus(err.status || 500));
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    server.closeAllConnections();
    return new Promise(resolve => server.close(resolve));
  });
  return server;
}

function post(server, contentType, encoding, body, trailing = Buffer.alloc(0)) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1',
      port: server.address().port,
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Content-Encoding': encoding,
        'Content-Length': body.length + trailing.length,
        Connection: 'keep-alive'
      }
    }, res => {
      let response = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { response += chunk; });
      res.on('end', () => {
        // A complete deflate frame ends the decoder before the HTTP request
        // ends. Deliver more bytes only after the parser has returned.
        if (trailing.length) req.end(trailing);
        resolve({ status: res.statusCode, body: response });
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(2000, () => req.destroy(new Error('Request timed out')));
    if (trailing.length) req.write(body);
    else req.end(body);
  });
}

function checkHealth(server) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: server.address().port, path: '/health' }, res => {
      assert.equal(res.statusCode, 200);
      res.resume();
      res.on('end', resolve);
      res.on('error', reject);
    }).on('error', reject);
  });
}

test('parses ordinary gzip and deflate request bodies', { timeout: 5000 }, async t => {
  const server = await startServer(t);
  for (const [contentType, input] of [
    ['application/json', '{"value":"ok"}'],
    ['application/x-www-form-urlencoded', 'value=ok']
  ]) {
    for (const [encoding, compress] of [['gzip', gzipSync], ['deflate', deflateSync]]) {
      const response = await post(server, contentType, encoding, compress(input));
      assert.equal(response.status, 200);
      assert.deepEqual(JSON.parse(response.body), { value: 'ok' });
    }
  }
});

test('survives trailing bytes after a parsed deflate body', { timeout: 5000 }, async t => {
  const server = await startServer(t);
  const ended = new Promise(resolve => {
    server.once('request', req => req.once('end', resolve));
  });
  const response = await post(server, 'application/json', 'deflate',
    Buffer.concat([deflateSync('{"value":"ok"}'), Buffer.from([0])]),
    Buffer.from('trailing bytes'));
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(response.body), { value: 'ok' });
  await ended;
  // Allow asynchronous decoder errors to surface before checking availability.
  await new Promise(resolve => setImmediate(resolve));
  await checkHealth(server);
});

test('survives trailing bytes after a gzip body', { timeout: 5000 }, async t => {
  const server = await startServer(t);
  const body = Buffer.concat([
    gzipSync('{"value":"ok"}'), Buffer.from([0]), Buffer.alloc(100 * 1024, 0x58)
  ]);
  const response = await post(server, 'application/json', 'gzip', body);
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(response.body), { value: 'ok' });
  // The response can finish before the remaining socket data is processed.
  await new Promise(resolve => setTimeout(resolve, 200));
  await checkHealth(server);
});
