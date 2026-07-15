#!/usr/bin/env node
'use strict';

const { parseArgs } = require('../src/parse-args');
const { upload } = require('../src/upload');
const { preview } = require('../src/preview');
const { doctor } = require('../src/doctor');

function printHelp() {
  console.log(`
@howie777/mp-ci — 微信小程序上传 / 预览（miniprogram-ci 薄封装）

用法:
  mp-ci upload [project] [options]
  mp-ci preview [project] [options]
  mp-ci doctor [project] [options]

选项:
  -c, --config <path>   配置文件路径（默认找 mp-ci.config.cjs）
  --desc <text>         版本描述
  --robot <n>           CI 机器人编号 (1-30)
  --ver <version>       上传版本号（仅 upload）
  --format <type>       预览二维码: image | base64 | terminal
  --page <path>         预览页面路径
  --query <qs>          预览启动参数
  -h, --help            显示帮助

配置钩子（mp-ci.config.cjs）:
  preUpload / prePreview   上传或预览前执行的壳命令

环境变量:
  MP_CI_PRIVATE_KEY_PATH  私钥文件绝对/相对路径
  MP_CI_NODE / NODE_BINARY  fork 子进程使用的 node 路径

示例:
  mp-ci upload --desc "修复裂图" --ver 1.0.5
  mp-ci preview uniapp --format terminal
  mp-ci doctor
`);
}

async function main() {
  const args = parseArgs();

  if (args.help || !args.command) {
    printHelp();
    process.exit(0);
  }

  const common = {
    projectKey: args.projectKey,
    config: args.config,
    desc: args.desc,
    robot: args.robot,
  };

  if (args.command === 'upload') {
    await upload({ ...common, ver: args.ver });
    return;
  }
  if (args.command === 'preview') {
    await preview({
      ...common,
      format: args.format,
      page: args.page,
      query: args.query,
    });
    return;
  }
  if (args.command === 'doctor') {
    await doctor(common);
    return;
  }

  console.error(`未知命令: ${args.command}`);
  printHelp();
  process.exit(1);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
