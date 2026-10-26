const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';
const webpack = require('webpack');
const configFactory = require('../config/webpack.config');

for (const mode of ['development', 'production']) {
  test('builds CSS imports and modules in ' + mode, async () => {
    // Keep fixtures outside app source to exercise CSS without unrelated JSX
    // linting or the debugging app's generated MathQuill artifacts.
    const dir = fs.mkdtempSync(path.join(__dirname, '../node_modules/.css-test-'));
    const output = fs.mkdtempSync(path.join(os.tmpdir(), 'msquill-css-build-'));
    try {
      fs.writeFileSync(path.join(dir, 'index.js'),
        "require('./global.css'); module.exports = require('./sample.module.css');");
      fs.writeFileSync(path.join(dir, 'global.css'),
        '@import "./imported.css"; @keyframes pulse { to { opacity: 0.5 } }');
      fs.writeFileSync(path.join(dir, 'imported.css'), 'body { margin: 0px }');
      fs.writeFileSync(path.join(dir, 'sample.module.css'),
        ':root { --accent: red } .box { color: var(--accent); display: flex }');
      const config = configFactory(mode);
      config.entry = path.join(dir, 'index.js');
      config.output.path = output;
      // The fixture is plain JavaScript; leave JSX/Babel processing out of this
      // CSS integration test (legacy Babel caching requires MD4 on newer Node).
      for (const rule of config.module.rules) {
        if (rule.oneOf) {
          rule.oneOf = rule.oneOf.filter(
            loader => loader.loader !== require.resolve('babel-loader')
          );
        }
      }
      // HTML template and service-worker compilation are unrelated to CSS.
      config.plugins = config.plugins.filter(
        plugin => plugin.constructor.name === 'MiniCssExtractPlugin'
      );
      // Only CSS minification is relevant to this fixture.
      config.optimization.minimizer = config.optimization.minimizer.filter(
        plugin => plugin.constructor.name === 'OptimizeCssAssetsWebpackPlugin'
      );
      const stats = await new Promise((resolve, reject) => {
        webpack(config).run((error, result) => error ? reject(error) : resolve(result));
      });
      assert.equal(stats.hasErrors(), false, stats.toString({ all: false, errors: true }));
      const assets = stats.compilation.assets;
      if (mode === 'production') {
        const css = Object.keys(assets).filter(name => name.endsWith('.css'))
          .map(name => assets[name].source()).join('\n');
        assert.match(css, /body\{margin:0\}/);
        assert.match(css, /@keyframes pulse/);
        assert.match(css, /sample_box__/);
        assert.match(css, /color:red/);
      } else {
        const bundle = Object.keys(assets).filter(name => name.endsWith('.js'))
          .map(name => assets[name].source()).join('\n');
        assert.match(bundle, /sample_box__/);
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
      fs.rmSync(output, { recursive: true, force: true });
    }
  });
}
