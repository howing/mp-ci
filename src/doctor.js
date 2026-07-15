'use strict';

const fs = require('fs');
const path = require('path');
const { resolveProject } = require('./resolve-project');

function ok(msg) {
  console.log(`  ✅ ${msg}`);
}

function warn(msg) {
  console.log(`  ⚠️  ${msg}`);
}

function fail(msg) {
  console.log(`  ❌ ${msg}`);
}

async function doctor(options = {}) {
  console.log('');
  console.log('==========================================');
  console.log('  mp-ci doctor');
  console.log('==========================================');

  let projectConfig;
  try {
    projectConfig = resolveProject(options);
  } catch (error) {
    fail(error.message || String(error));
    process.exit(1);
  }

  console.log(`  配置:     ${projectConfig.configPath}`);
  console.log(`  项目:     ${projectConfig.name} (${projectConfig.projectKey})`);
  console.log(`  AppID:    ${projectConfig.appid}`);
  console.log(`  版本:     ${projectConfig.version}`);
  console.log('');

  let errors = 0;

  if (fs.existsSync(projectConfig.projectPath)) {
    ok(`构建目录存在: ${projectConfig.projectPath}`);
    const pc = path.join(projectConfig.projectPath, 'project.config.json');
    if (fs.existsSync(pc)) {
      ok('project.config.json 存在');
    } else {
      errors += 1;
      fail(`缺少 project.config.json: ${pc}`);
    }
  } else {
    errors += 1;
    fail(`构建目录不存在: ${projectConfig.projectPath}`);
    warn('请先构建小程序产物');
  }

  if (fs.existsSync(projectConfig.privateKeyPath)) {
    ok(`密钥文件存在: ${projectConfig.privateKeyPath}`);
  } else {
    errors += 1;
    fail(`密钥文件不存在: ${projectConfig.privateKeyPath}`);
  }

  if (projectConfig.manifestPath) {
    if (fs.existsSync(projectConfig.manifestPath)) {
      ok(`manifest: ${projectConfig.manifestPath}`);
    } else {
      warn(`manifestPath 配置了但文件不存在: ${projectConfig.manifestPath}`);
    }
  } else {
    warn('未配置 / 未探测到 manifestPath（将依赖配置或 project.config.json）');
  }

  if (process.execPath && fs.existsSync(process.execPath)) {
    ok(`node: ${process.execPath}`);
  } else {
    warn(
      `process.execPath 无效: ${process.execPath}（上传时会走 MP_CI_NODE 兜底）`
    );
  }

  if (projectConfig.preUpload) {
    ok(`preUpload: ${projectConfig.preUpload}`);
  } else {
    warn('未配置 preUpload（上传前需自行构建产物）');
  }
  if (projectConfig.prePreview) {
    ok(`prePreview: ${projectConfig.prePreview}`);
  }

  console.log('');
  if (errors > 0) {
    console.log(`doctor 完成：发现 ${errors} 个问题`);
    process.exit(1);
  }
  console.log('doctor 完成：看起来可以上传 / 预览');
  console.log('');
}

module.exports = { doctor };
