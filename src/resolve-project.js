'use strict';

const fs = require('fs');
const path = require('path');
const { loadConfig } = require('./load-config');
const { defaultSetting } = require('./defaults');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function resolveFromCwd(cwd, maybePath) {
  if (!maybePath) return null;
  return path.isAbsolute(maybePath) ? maybePath : path.resolve(cwd, maybePath);
}

function readManifest(manifestPath) {
  if (!manifestPath || !fs.existsSync(manifestPath)) return null;
  return readJson(manifestPath);
}

function readProjectConfig(projectPath) {
  const file = path.join(projectPath, 'project.config.json');
  if (!fs.existsSync(file)) return null;
  return readJson(file);
}

function pickProjectEntry(raw, projectKey) {
  if (raw.projects && typeof raw.projects === 'object') {
    const keys = Object.keys(raw.projects);
    if (keys.length === 0) {
      throw new Error('配置中 projects 为空');
    }
    const key = projectKey || raw.defaultProject || keys[0];
    if (!raw.projects[key]) {
      throw new Error(
        `不支持的项目: "${key}"，可选项: ${keys.join(', ')}`
      );
    }
    return {
      projectKey: key,
      entry: { ...raw, ...raw.projects[key], projects: undefined },
    };
  }

  if (projectKey && projectKey !== (raw.name || 'default')) {
    throw new Error(
      `当前为单项目配置，不支持项目名 "${projectKey}"。请使用 projects 字段配置多项目。`
    );
  }

  return {
    projectKey: projectKey || raw.defaultProject || 'default',
    entry: raw,
  };
}

function resolveAppId({ entry, projectPath, manifestPath }) {
  if (entry.appid) return entry.appid;

  const manifest = readManifest(manifestPath);
  const fromManifest = manifest?.['mp-weixin']?.appid;
  if (fromManifest) return fromManifest;

  const projectConfig = readProjectConfig(projectPath);
  if (projectConfig?.appid) return projectConfig.appid;

  throw new Error(
    [
      '无法解析 AppID。请任选其一：',
      '1. 在 mp-ci.config.cjs 中设置 appid',
      '2. 设置 manifestPath，并确保 mp-weixin.appid 存在',
      '3. 先构建产物，确保 projectPath/project.config.json 含 appid',
    ].join('\n')
  );
}

function resolveVersion({ entry, manifestPath }) {
  if (entry.version) return entry.version;

  const manifest = readManifest(manifestPath);
  if (manifest?.versionName) return manifest.versionName;

  return '1.0.0';
}

function resolvePrivateKeyPath({ cwd, entry, appid }) {
  if (process.env.MP_CI_PRIVATE_KEY_PATH) {
    const fromEnv = resolveFromCwd(cwd, process.env.MP_CI_PRIVATE_KEY_PATH);
    if (!fs.existsSync(fromEnv)) {
      throw new Error(`环境变量 MP_CI_PRIVATE_KEY_PATH 指向的文件不存在: ${fromEnv}`);
    }
    return fromEnv;
  }

  if (entry.privateKeyPath) {
    const keyPath = resolveFromCwd(cwd, entry.privateKeyPath);
    if (!fs.existsSync(keyPath)) {
      throw new Error(`未找到密钥文件: ${keyPath}`);
    }
    return keyPath;
  }

  const keyDir = resolveFromCwd(cwd, entry.privateKeyDir || 'ci/keys');
  const keyPath = path.join(keyDir, `private.${appid}.key`);
  if (!fs.existsSync(keyPath)) {
    throw new Error(
      [
        `未找到密钥文件: ${keyPath}`,
        '',
        '请按以下步骤获取密钥：',
        '1. 登录微信公众平台 (https://mp.weixin.qq.com)',
        '2. 进入「开发管理」→「开发设置」→「小程序代码上传」',
        '3. 生成并下载代码上传密钥',
        `4. 将密钥文件重命名为 private.${appid}.key 并放到 ${keyDir}`,
        '5. 同时请配置 IP 白名单',
        '',
        '也可设置 privateKeyPath / 环境变量 MP_CI_PRIVATE_KEY_PATH',
      ].join('\n')
    );
  }
  return keyPath;
}

function resolveManifestPath(cwd, entry, projectPath) {
  if (entry.manifestPath) {
    return resolveFromCwd(cwd, entry.manifestPath);
  }

  // uni-app 常见布局：与 dist 同级的 src/manifest.json
  // e.g. uniapp/dist/build/mp-weixin → uniapp/src/manifest.json
  const guess = path.resolve(projectPath, '../../../src/manifest.json');
  if (fs.existsSync(guess)) return guess;

  return null;
}

/**
 * 解析最终可上传/预览的项目配置。
 */
function resolveProject(options = {}) {
  const { cwd, configPath, raw } = loadConfig(options);
  const { projectKey, entry } = pickProjectEntry(raw, options.projectKey);

  if (!entry.projectPath) {
    throw new Error(
      `配置缺少 projectPath（项目 ${projectKey}，配置文件 ${configPath}）`
    );
  }

  const projectPath = resolveFromCwd(cwd, entry.projectPath);
  const manifestPath = resolveManifestPath(cwd, entry, projectPath);
  const appid = resolveAppId({ entry, projectPath, manifestPath });
  const version = resolveVersion({ entry, manifestPath });
  const privateKeyPath = resolvePrivateKeyPath({ cwd, entry, appid });
  const qrcodeDir = resolveFromCwd(cwd, entry.qrcodeDir || 'ci/preview');
  const setting = { ...defaultSetting, ...(entry.setting || {}) };

  return {
    cwd,
    configPath,
    projectKey,
    name: entry.name || projectKey,
    appid,
    version,
    projectPath,
    privateKeyPath,
    manifestPath,
    qrcodeDir,
    setting,
    ignores: entry.ignores || ['node_modules/**/*'],
    preUpload: entry.preUpload || null,
    prePreview: entry.prePreview || null,
  };
}

module.exports = {
  resolveProject,
  readManifest,
  readProjectConfig,
};
