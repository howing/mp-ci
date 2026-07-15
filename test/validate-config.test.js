'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { validateRawConfig } = require('../src/validate-config');

describe('validateRawConfig', () => {
  it('accepts single-project config', () => {
    assert.doesNotThrow(() =>
      validateRawConfig(
        { projectPath: 'dist/mp-weixin', name: 'demo' },
        'mp-ci.config.cjs'
      )
    );
  });

  it('rejects missing projectPath', () => {
    assert.throws(
      () => validateRawConfig({ name: 'demo' }, 'x.cjs'),
      /projectPath/
    );
  });

  it('rejects bad defaultProject', () => {
    assert.throws(
      () =>
        validateRawConfig(
          {
            defaultProject: 'missing',
            projects: {
              uniapp: { projectPath: 'a' },
            },
          },
          'x.cjs'
        ),
      /defaultProject/
    );
  });

  it('rejects non-string preUpload', () => {
    assert.throws(
      () =>
        validateRawConfig(
          { projectPath: 'a', preUpload: ['npm', 'run', 'build'] },
          'x.cjs'
        ),
      /preUpload/
    );
  });
});
