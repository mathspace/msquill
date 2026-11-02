const assert = require('node:assert/strict');
const { test } = require('node:test');

const selfsignedPath = require.resolve('selfsigned', {
  paths: [require.resolve('webpack-dev-server')]
});
const forge = require(require.resolve('node-forge', { paths: [selfsignedPath] }));

for (const server of [false, true]) {
  test(`processes many pre-handshake TLS records without stack exhaustion (${server ? 'server' : 'client'})`, () => {
    const connection = forge.tls.createConnection({
      server,
      tlsDataReady() {},
      error(connection, error) {
        assert.fail(error.message);
      }
    });
    // Each empty heartbeat request used to add another level of recursion.
    const record = forge.util.hexToBytes('1803010003010000');
    assert.doesNotThrow(() => connection.process(record.repeat(50000)));
    assert.equal(connection.input.length(), 0);
    assert.equal(connection.fail, false);

    // Partial records must continue to work after draining the batch.
    for (const byte of record) connection.process(byte);
    assert.equal(connection.input.length(), 0);
    assert.equal(connection.fail, false);
  });
}
