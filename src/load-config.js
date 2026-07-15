'use strict';

const fs = require('fs');
const path = require('path');
const { CONFIG_FILENAMES } = require('./defaults');
const { validateRawConfig } = require('./validate-config');

function findConfigPath(cwd, explicit) {
  if (explicit) {
    const abs = path.resolve(cwd, explicit);
    if (!fs.existsSync(abs)) {
      throw new Error(`配置文件不存在: ${abs}`);
    }
    return abs;
  }

  for (const name of CONFIG_FILENAMES) {
    const candidate = path.join(cwd, name);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * 加载项目配置。返回 { cwd, configPath, raw }。
 */
function loadConfig(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const configPath = findConfigPath(cwd, options.config);

  if (!configPath) {
    throw new Error(
      [
        `未找到 mp-ci 配置文件（在 ${cwd} 下查找 ${CONFIG_FILENAMES.join(' / ')}）`,
        '',
        '请在项目根目录创建 mp-ci.config.cjs，例如：',
        '',
        '  module.exports = {',
        "    name: '我的小程序',",
        "    projectPath: 'dist/build/mp-weixin',",
        "    manifestPath: 'src/manifest.json',",
        "    privateKeyDir: 'ci/keys',",
        '  };',
      ].join('\n')
    );
  }

  // 清缓存，便于重复执行时拿到最新配置
  delete require.cache[require.resolve(configPath)];
  const raw = require(configPath);
  const config = typeof raw === 'function' ? raw() : raw;

  if (!config || typeof config !== 'object') {
    throw new Error(`配置文件必须导出对象或返回对象的函数: ${configPath}`);
  }

  validateRawConfig(config, configPath);

  return { cwd, configPath, raw: config };
}

module.exports = {
  findConfigPath,
  loadConfig,
};
