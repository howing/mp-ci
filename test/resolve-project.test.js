'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { resolveProject } = require('../src/resolve-project');

describe('resolveProject', () => {
  let tmp;

  before(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-ci-'));
    const dist = path.join(tmp, 'dist', 'mp-weixin');
    fs.mkdirSync(dist, { recursive: true });
    fs.writeFileSync(
      path.join(dist, 'project.config.json'),
      JSON.stringify({ appid: 'wx_test_appid' })
    );
    fs.mkdirSync(path.join(tmp, 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, 'src', 'manifest.json'),
      JSON.stringify({
        versionName: '9.8.7',
        'mp-weixin': { appid: 'wx_from_manifest' },
      })
    );
    fs.mkdirSync(path.join(tmp, 'ci', 'keys'), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, 'ci', 'keys', 'private.wx_from_manifest.key'),
      'fake-key'
    );
    fs.writeFileSync(
      path.join(tmp, 'mp-ci.config.cjs'),
      `module.exports = {
        name: 'fixture',
        projectPath: 'dist/mp-weixin',
        manifestPath: 'src/manifest.json',
        privateKeyDir: 'ci/keys',
        preUpload: 'echo build',
      };`
    );
  });

  after(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('resolves appid/version/key from fixture config', () => {
    const cfg = resolveProject({ cwd: tmp });
    assert.equal(cfg.appid, 'wx_from_manifest');
    assert.equal(cfg.version, '9.8.7');
    assert.equal(cfg.name, 'fixture');
    assert.equal(cfg.preUpload, 'echo build');
    assert.ok(cfg.privateKeyPath.endsWith('private.wx_from_manifest.key'));
    assert.ok(cfg.projectPath.endsWith(path.join('dist', 'mp-weixin')));
  });
});
