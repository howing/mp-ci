'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs } = require('../src/parse-args');

describe('parseArgs', () => {
  it('parses upload command and flags', () => {
    const args = parseArgs([
      'upload',
      'uniapp',
      '--desc',
      'fix',
      '--ver',
      '1.2.3',
      '--robot',
      '2',
    ]);
    assert.equal(args.command, 'upload');
    assert.equal(args.projectKey, 'uniapp');
    assert.equal(args.desc, 'fix');
    assert.equal(args.ver, '1.2.3');
    assert.equal(args.robot, 2);
  });

  it('parses preview options', () => {
    const args = parseArgs([
      'preview',
      '--format',
      'terminal',
      '--page',
      'pages/a',
      '--query',
      'id=1',
    ]);
    assert.equal(args.command, 'preview');
    assert.equal(args.format, 'terminal');
    assert.equal(args.page, 'pages/a');
    assert.equal(args.query, 'id=1');
  });

  it('sets help flag', () => {
    assert.equal(parseArgs(['--help']).help, true);
  });
});
