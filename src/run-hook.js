'use strict';

const { execSync } = require('child_process');

/**
 * 执行配置中的壳命令钩子（如 preUpload）。
 * @param {string|null|undefined} command
 * @param {{ cwd: string, label: string }} options
 */
function runHook(command, { cwd, label }) {
  if (!command) return;

  console.log('');
  console.log(`⏳ 执行 ${label}: ${command}`);
  try {
    execSync(command, {
      cwd,
      stdio: 'inherit',
      env: process.env,
      shell: true,
    });
  } catch (error) {
    const code = error.status != null ? error.status : 1;
    throw new Error(`${label} 失败（exit ${code}）: ${command}`);
  }
  console.log(`✅ ${label} 完成`);
  console.log('');
}

module.exports = { runHook };
