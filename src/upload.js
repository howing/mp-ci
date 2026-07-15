'use strict';

require('./ensure-node-fork');
const ci = require('miniprogram-ci');
const { resolveProject } = require('./resolve-project');
const { runHook } = require('./run-hook');

async function upload(options = {}) {
  const projectConfig = resolveProject(options);
  const version = options.ver || projectConfig.version;
  const desc = options.desc || 'CI自动上传';
  const robot = options.robot != null ? options.robot : 1;

  console.log('');
  console.log('==========================================');
  console.log('  微信小程序代码上传');
  console.log('==========================================');
  console.log(`  项目:     ${projectConfig.name} (${projectConfig.projectKey})`);
  console.log(`  AppID:    ${projectConfig.appid}`);
  console.log(`  版本:     ${version}`);
  console.log(`  描述:     ${desc}`);
  console.log(`  机器人:   #${robot}`);
  console.log(`  构建目录: ${projectConfig.projectPath}`);
  console.log('==========================================');
  console.log('');

  try {
    runHook(projectConfig.preUpload, {
      cwd: projectConfig.cwd,
      label: 'preUpload',
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

  console.log('⏳ 正在上传代码...');

  try {
    const uploadResult = await ci.upload({
      project,
      version,
      desc,
      robot,
      setting: projectConfig.setting,
      onProgressUpdate: (task) => {
        if (task._status === 'done') {
          console.log(`  ✅ ${task._msg}`);
        }
      },
    });

    console.log('');
    console.log('🎉 上传成功！');
    console.log('');

    if (uploadResult.subPackageInfo) {
      console.log('📦 包大小信息:');
      uploadResult.subPackageInfo.forEach((pkg) => {
        const sizeKB = (pkg.size / 1024).toFixed(1);
        let label = pkg.name;
        if (pkg.name === '__FULL__') label = '总包';
        else if (pkg.name === '__APP__') label = '主包';
        console.log(`  ${label}: ${sizeKB} KB`);
      });
      console.log('');
    }

    console.log('📌 下一步操作:');
    console.log('  1. 登录微信公众平台 → 版本管理');
    console.log('  2. 在「开发版本」中找到刚上传的版本');
    console.log('  3. 提交审核 → 审核通过后发布');
    console.log('');
    return uploadResult;
  } catch (error) {
    console.error('');
    console.error('❌ 上传失败:', error.message || error);
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

module.exports = { upload };
