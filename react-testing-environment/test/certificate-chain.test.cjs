const assert = require('node:assert/strict');
const { test } = require('node:test');
const { X509Certificate, createPrivateKey } = require('node:crypto');

// Exercise the exact Forge installation used by webpack's certificate generator.
const selfsignedPath = require.resolve('selfsigned', {
  paths: [require.resolve('webpack-dev-server')]
});
const forge = require(require.resolve('node-forge', { paths: [selfsignedPath] }));

test('rejects a leaf without CA extensions used to sign another certificate', () => {
  const { pki } = forge;
  let serial = 0;
  function certificate(name, issuer, issuerKey, extensions) {
    const keys = pki.rsa.generateKeyPair(1024);
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '0' + (++serial);
    cert.validity.notBefore = new Date('2020-01-01');
    cert.validity.notAfter = new Date('2040-01-01');
    cert.setSubject([{ name: 'commonName', value: name }]);
    cert.setIssuer(issuer ? issuer.subject.attributes : cert.subject.attributes);
    if (extensions) cert.setExtensions(extensions);
    cert.sign(issuerKey || keys.privateKey, forge.md.sha256.create());
    return { cert, key: keys.privateKey };
  }

  const caExtensions = [
    { name: 'basicConstraints', cA: true },
    { name: 'keyUsage', keyCertSign: true }
  ];
  const root = certificate('trusted root', null, null, caExtensions);
  const store = pki.createCaStore([root.cert]);
  const leaf = certificate('ordinary leaf', root.cert, root.key);
  assert.equal(pki.verifyCertificateChain(store, [leaf.cert]), true);

  const forged = certificate('forged certificate', leaf.cert, leaf.key);
  assert.throws(
    () => pki.verifyCertificateChain(store, [forged.cert, leaf.cert]),
    error => error.error === pki.certificateError.bad_certificate
  );

  const intermediate = certificate('valid CA', root.cert, root.key, caExtensions);
  const valid = certificate('valid certificate', intermediate.cert, intermediate.key);
  assert.equal(pki.verifyCertificateChain(store, [valid.cert, intermediate.cert]), true);
});

test('webpack can still generate a matching self-signed certificate and key', () => {
  const generate = require('webpack-dev-server/lib/utils/createCertificate');
  const pem = generate();
  const cert = new X509Certificate(pem.cert);
  assert.equal(cert.checkPrivateKey(createPrivateKey(pem.private)), true);
  assert.equal(cert.verify(cert.publicKey), true);
  assert.equal(cert.checkHost('localhost'), 'localhost');
});
