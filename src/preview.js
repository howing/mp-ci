'use strict';

require('./ensure-node-fork');
const fs = require('fs');
const path = require('path');
const ci = require('miniprogram-ci');
const { resolveProject } = require('./resolve-project');
const { runHook } = require('./run-hook');

async function preview(options = {}) {
  const projectConfig = resolveProject(options);
  const desc = options.desc || 'CI预览';
  const robot = options.robot != null ? options.robot : 1;
  const format = options.format || 'image';
  const page = options.page || '';
  const query = options.query || '';

  if (!fs.existsSync(projectConfig.qrcodeDir)) {
    fs.mkdirSync(projectConfig.qrcodeDir, { recursive: true });
  }
  const qrcodeOutputDest = path.join(
    projectConfig.qrcodeDir,
    `${projectConfig.projectKey}-preview.jpg`
  );

  console.log('');
  console.log('==========================================');
  console.log('  微信小程序预览');
  console.log('==========================================');
  console.log(`  项目:     ${projectConfig.name} (${projectConfig.projectKey})`);
  console.log(`  AppID:    ${projectConfig.appid}`);
  console.log(`  描述:     ${desc}`);
  console.log(`  机器人:   #${robot}`);
  console.log(
    `  二维码:   ${format === 'terminal' ? '终端输出' : qrcodeOutputDest}`
  );
  if (page) {
    console.log(`  预览页面: ${page}`);
  }
  if (query) {
    console.log(`  启动参数: ${query}`);
  }
  console.log(`  构建目录: ${projectConfig.projectPath}`);
  console.log('==========================================');
  console.log('');

  try {
    runHook(projectConfig.prePreview, {
      cwd: projectConfig.cwd,
      label: 'prePreview',
    });
  } catch (error) {
    console.error('');
    console.error('❌', error.message || error);
    process.exit(1);
  }

  const project = new ci.Project({
    appid: projectConfig.appid,
    type: 'miniProgram',
    projectPath: projectConfig.projectPath,
    privateKeyPath: projectConfig.privateKeyPath,
    ignores: projectConfig.ignores,
  });

  console.log('⏳ 正在生成预览...');

  try {
    const previewOptions = {
      project,
      desc,
      robot,
      setting: projectConfig.setting,
      qrcodeFormat: format,
      onProgressUpdate: (task) => {
        if (task._status === 'done') {
          console.log(`  ✅ ${task._msg}`);
        }
      },
    };

    if (format !== 'terminal') {
      previewOptions.qrcodeOutputDest = qrcodeOutputDest;
    }
    if (page) {
      previewOptions.pagePath = page;
    }
    if (query) {
      previewOptions.searchQuery = query;
    }

    const previewResult = await ci.preview(previewOptions);

    console.log('');
    console.log('🎉 预览生成成功！');
    console.log('');

    if (format === 'image') {
      console.log('📱 请使用微信扫描二维码预览:');
      console.log(`   ${qrcodeOutputDest}`);
    } else if (format === 'base64') {
      console.log('📱 二维码 Base64 已保存至:');
      console.log(`   ${qrcodeOutputDest}`);
    }

    if (previewResult.subPackageInfo) {
      console.log('');
      console.log('📦 包大小信息:');
      previewResult.subPackageInfo.forEach((pkg) => {
        const sizeKB = (pkg.size / 1024).toFixed(1);
        let label = pkg.name;
        if (pkg.name === '__FULL__') label = '总包';
        else if (pkg.name === '__APP__') label = '主包';
        console.log(`  ${label}: ${sizeKB} KB`);
      });
    }

    console.log('');
    return previewResult;
  } catch (error) {
    console.error('');
    console.error('❌ 预览失败:', error.message || error);
    console.error('');

    if (error.message?.includes('private key')) {
      console.error('💡 请检查密钥文件是否正确');
    }
    if (error.message?.includes('white list')) {
      console.error('💡 请检查 IP 白名单是否已配置');
    }
    if (error.message?.includes('project.config.json')) {
      console.error('💡 请先执行构建命令生成小程序产物，再确认 projectPath 配置正确');
    }

    process.exit(1);
  }
}

module.exports = { preview };
