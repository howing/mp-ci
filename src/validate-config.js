'use strict';

/** 顶层与项目 entry 允许的字段（多余字段仅警告） */
const KNOWN_ROOT_KEYS = new Set([
  'name',
  'projectPath',
  'manifestPath',
  'appid',
  'version',
  'privateKeyDir',
  'privateKeyPath',
  'qrcodeDir',
  'setting',
  'ignores',
  'preUpload',
  'prePreview',
  'projects',
  'defaultProject',
]);

const KNOWN_PROJECT_KEYS = new Set([
  'name',
  'projectPath',
  'manifestPath',
  'appid',
  'version',
  'privateKeyDir',
  'privateKeyPath',
  'qrcodeDir',
  'setting',
  'ignores',
  'preUpload',
  'prePreview',
]);

function warnUnknownKeys(obj, known, label) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (!known.has(key)) {
      console.warn(`[mp-ci] 配置警告: ${label} 含未知字段 "${key}"，将被忽略语义`);
    }
  }
}

/**
 * 校验原始配置结构，尽早给出字段级错误。
 * @returns {string[]} warnings（非致命）
 */
function validateRawConfig(raw, configPath) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`配置必须是对象: ${configPath}`);
  }

  warnUnknownKeys(raw, KNOWN_ROOT_KEYS, '根配置');

  if (raw.projects != null) {
    if (typeof raw.projects !== 'object' || Array.isArray(raw.projects)) {
      throw new Error(`projects 必须是对象: ${configPath}`);
    }
    const keys = Object.keys(raw.projects);
    if (keys.length === 0) {
      throw new Error(`projects 不能为空: ${configPath}`);
    }
    if (raw.defaultProject && !raw.projects[raw.defaultProject]) {
      throw new Error(
        `defaultProject "${raw.defaultProject}" 不在 projects 中（可选: ${keys.join(', ')}）`
      );
    }
    for (const key of keys) {
      const entry = raw.projects[key];
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new Error(`projects.${key} 必须是对象: ${configPath}`);
      }
      warnUnknownKeys(entry, KNOWN_PROJECT_KEYS, `projects.${key}`);
      if (!entry.projectPath && !raw.projectPath) {
        throw new Error(
          `缺少 projectPath：请在 projects.${key} 或根配置中设置（${configPath}）`
        );
      }
      if (entry.setting != null && (typeof entry.setting !== 'object' || Array.isArray(entry.setting))) {
        throw new Error(`projects.${key}.setting 必须是对象: ${configPath}`);
      }
      for (const hook of ['preUpload', 'prePreview']) {
        if (entry[hook] != null && typeof entry[hook] !== 'string') {
          throw new Error(`projects.${key}.${hook} 必须是字符串命令: ${configPath}`);
        }
      }
    }
  } else if (!raw.projectPath) {
    throw new Error(
      `缺少 projectPath：单项目配置必须设置 projectPath（${configPath}）`
    );
  }

  if (raw.setting != null && (typeof raw.setting !== 'object' || Array.isArray(raw.setting))) {
    throw new Error(`setting 必须是对象: ${configPath}`);
  }
  for (const hook of ['preUpload', 'prePreview']) {
    if (raw[hook] != null && typeof raw[hook] !== 'string') {
      throw new Error(`${hook} 必须是字符串命令: ${configPath}`);
    }
  }

  return [];
}

module.exports = {
  validateRawConfig,
  KNOWN_ROOT_KEYS,
  KNOWN_PROJECT_KEYS,
};
