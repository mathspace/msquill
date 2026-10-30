const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');

// Exercise Jest's actual dependency and both published JavaScript entry points.
const entry = require.resolve('deepmerge', {
  paths: [require.resolve('jest-config')]
});
const variants = [
  ['CommonJS', require(entry)],
  ['UMD', require(path.join(path.dirname(entry), 'umd.js'))]
];

function assertSafe(object) {
  assert.equal(Object.getPrototypeOf(object), Object.prototype);
  assert.equal(object.isAdmin, undefined);
  assert.equal(Object.hasOwn(object, '__proto__'), false);
  assert.equal(Object.prototype.isAdmin, undefined);
}

for (const [name, merge] of variants) {
  test(name + ' rejects source __proto__ keys with a null-prototype target', () => {
    const target = Object.assign(Object.create(null), { debug: false });
    const source = JSON.parse('{"__proto__":{"isAdmin":true},"verbose":true}');
    const result = merge(target, source);
    assertSafe(result);
    assert.equal(result.debug, false);
    assert.equal(result.verbose, true);
  });

  test(name + ' rejects nested __proto__ keys over primitive placeholders', () => {
    for (const session of [null, undefined, false, 0, '']) {
      const source = JSON.parse('{"session":{"__proto__":{"isAdmin":true},"id":1}}');
      const result = merge({ session }, source);
      assertSafe(result.session);
      assert.equal(result.session.id, 1);
    }
  });

  test(name + ' rejects own __proto__ keys when copying the target', () => {
    const target = JSON.parse('{"__proto__":{"isAdmin":true},"debug":false}');
    const result = merge(target, { verbose: true });
    assertSafe(result);
    assert.equal(result.debug, false);
    assert.equal(result.verbose, true);
    assert.equal(Object.hasOwn(target, '__proto__'), true);
  });

  test(name + ' rejects __proto__ keys when both operands own the key', () => {
    const target = JSON.parse('{"__proto__":{"isAdmin":false}}');
    const source = JSON.parse('{"__proto__":{"isAdmin":true}}');
    assertSafe(merge(target, source));
  });

  test(name + ' keeps cloned array elements safe', () => {
    const source = JSON.parse('{"list":[{"__proto__":{"isAdmin":true},"id":1}]}');
    const result = merge({ list: [] }, source);
    assertSafe(result.list[0]);
    assert.equal(result.list[0].id, 1);
  });

  test(name + ' preserves ordinary configuration merging and custom options', () => {
    const symbol = Symbol('option');
    const target = { nested: { enabled: true }, list: [1], [symbol]: 'kept' };
    const source = { nested: { limit: 2 }, list: [2] };
    const result = merge(target, source);
    assert.deepEqual(result, {
      nested: { enabled: true, limit: 2 }, list: [1, 2], [symbol]: 'kept'
    });
    assert.notEqual(result.nested, target.nested);
    assert.deepEqual(target.list, [1]);
    assert.deepEqual(merge.all([{ first: true }, { second: true }]), {
      first: true, second: true
    });
    assert.deepEqual(merge(target, source, {
      customMerge: key => key === 'list' ? (left, right) => right : undefined
    }).list, [2]);
    assert.equal(merge({}, target, { clone: false }).nested, target.nested);
  });
}
