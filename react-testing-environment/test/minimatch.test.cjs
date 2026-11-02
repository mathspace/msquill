const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, writeFileSync, mkdirSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

test('legacy consumers resolve the backport and retain the callable API', () => {
  for (const consumer of ['glob', 'eslint', 'eslint-plugin-import', 'fork-ts-checker-webpack-plugin-alt',
    'recursive-readdir', 'test-exclude']) {
    const resolved = require.resolve('minimatch', {
      paths: [require.resolve(consumer)]
    });
    const match = require(resolved);
    assert.equal(require(path.join(path.dirname(resolved), '../../package.json')).version, '10.2.6');
    assert.equal(typeof match, 'function');
    assert.equal(match('src/example.js', '**/*.js'), true);
    assert.equal(match.makeRe('*.js').test('example.js'), true);
    assert.equal(match.defaults({ dot: true })('.hidden.js', '*.js'), true);
  }
});

test('glob and recursive-readdir retain filesystem matching', async () => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'msquill-minimatch-'));
  try {
    mkdirSync(path.join(cwd, 'nested'));
    for (const name of ['a.js', '.hidden.js', 'nested/b.js', 'nested/c.txt']) {
      writeFileSync(path.join(cwd, name), '');
    }
    assert.deepEqual(require('glob').sync('**/*.js', { cwd }).sort(), ['a.js', 'nested/b.js']);
    const asyncMatches = await new Promise((resolve, reject) => {
      require('glob')('**/*.js', { cwd }, (error, matches) => error ? reject(error) : resolve(matches));
    });
    assert.deepEqual(asyncMatches.sort(), ['a.js', 'nested/b.js']);
    assert.deepEqual(require('glob').sync('**/*.js', { cwd, dot: true }).sort(),
      ['.hidden.js', 'a.js', 'nested/b.js']);
    const files = await require('recursive-readdir')(cwd, ['*.txt']);
    assert.deepEqual(files.map(file => path.relative(cwd, file)).sort(),
      ['.hidden.js', 'a.js', 'nested/b.js']);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test('ESLint retains glob-based file and override selection', () => {
  const { CLIEngine } = require('eslint');
  const engine = new CLIEngine({
    useEslintrc: false,
    baseConfig: {
      parserOptions: { ecmaVersion: 2018 },
      overrides: [{ files: ['**/*.js'], rules: { semi: ['error', 'always'] } }]
    }
  });
  assert.equal(engine.executeOnText('const value = 1;', 'example.js').errorCount, 0);
  assert.equal(engine.executeOnText('const value = 1', 'example.js').errorCount, 1);
});

test('coverage file selection retains minimatch behavior', () => {
  const TestExclude = require('test-exclude');
  const cwd = path.join(tmpdir(), 'msquill-coverage');
  const selection = new TestExclude({ cwd });
  assert.equal(selection.shouldInstrument(path.join(cwd, 'src/example.js')), true);
  assert.equal(selection.shouldInstrument(path.join(cwd, 'src/example.test.js')), false);
  assert.equal(selection.shouldInstrument(path.join(cwd, 'node_modules/dependency/index.js')), false);
});

test('CommonJS and ESM cap globparts amplification and avoid large pairwise passes', () => {
  // The vulnerable fixpoint expansion can stall the event loop. Isolate it so
  // a regression is terminated instead of exhausting the test runner.
  const result = spawnSync(process.execPath, ['--max-old-space-size=256', '-e', `
    const assert = require('node:assert/strict');
    const { pathToFileURL } = require('node:url');
    const path = require('node:path');
    const cjs = require.resolve('minimatch');
    (async () => {
      const esm = await import(pathToFileURL(path.join(path.dirname(cjs), '../esm/index.js')));
      for (const { Minimatch } of [require(cjs), esm]) {
        const pattern = Array(30).fill('**/../a/b').join('/');
        const mm = new Minimatch(pattern, { optimizationLevel: 2, braceExpandMax: 64 });
        assert.equal(mm.set.length, 64);
        const small = new Minimatch('**/../a/b/**/../c/d', { optimizationLevel: 2 });
        assert.equal(small.set.length, 4);
        assert.equal(small.match('../a/b/../c/d'), true);
        assert.equal(small.match('x/a/b/y/c/d'), true);
        const large = new Minimatch('{x,*}/{0..999}', { optimizationLevel: 2 });
        assert.equal(large.set.length, 2000);
        assert.equal(large.match('x/5'), true);
        assert.equal(large.match('y/999'), true);
        assert.equal(large.match('.y/5'), false);
      }
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `], { timeout: 10000, encoding: 'utf8' });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
});
