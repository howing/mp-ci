'use strict';

/** 默认编译设置（对应微信开发者工具编译选项） */
const defaultSetting = {
  es6: true,
  es7: true,
  minifyJS: true,
  minifyWXML: true,
  minifyWXSS: true,
  codeProtect: false,
  autoPrefixWXSS: true,
};

const CONFIG_FILENAMES = [
  'mp-ci.config.cjs',
  'mp-ci.config.js',
  '.mp-ci.config.cjs',
  '.mp-ci.config.js',
];

module.exports = {
  defaultSetting,
  CONFIG_FILENAMES,
};
