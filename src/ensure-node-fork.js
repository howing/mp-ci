/**
 * miniprogram-ci 会通过 child_process.fork 拉起 summer 编译子进程，默认使用 process.execPath。
 * 本机升级/卸载 Node 后，execPath 仍可能指向已删除路径，导致 ENOENT。
 *
 * 在 require('miniprogram-ci') 之前执行本模块，对 fork 做兜底。
 *
 * 可选环境变量（绝对路径）：
 *   MP_CI_NODE 或 NODE_BINARY
 */
'use strict';

const fs = require('fs');
const cp = require('child_process');

function resolveWorkingNodeBinary() {
  const fromEnv = process.env.MP_CI_NODE || process.env.NODE_BINARY;
  if (fromEnv && fs.existsSync(fromEnv)) {
    try {
      return fs.realpathSync(fromEnv);
    } catch {
      return fromEnv;
    }
  }
  if (process.execPath && fs.existsSync(process.execPath)) {
    try {
      return fs.realpathSync(process.execPath);
    } catch {
      return process.execPath;
    }
  }
  try {
    const out = cp.execSync('command -v node', { encoding: 'utf8', shell: true }).trim();
    if (out && fs.existsSync(out)) {
      return fs.realpathSync(out);
    }
  } catch {
    /* ignore */
  }
  return null;
}

function patchChildProcessFork() {
  const resolved = resolveWorkingNodeBinary();
  if (!resolved) {
    console.error(
      '[mp-ci] 无法找到可用的 node 可执行文件（process.execPath 不存在且 PATH 中无 node）。\n' +
        '请安装 Node 或设置环境变量：export MP_CI_NODE="$(command -v node)"'
    );
    process.exit(1);
  }

  if (resolved !== process.execPath) {
    console.warn('[mp-ci] process.execPath 无效或缺失，子进程将使用:', resolved);
  }

  const origFork = cp.fork;
  cp.fork = function patchedFork(modulePath, args, options) {
    const opts = options ? { ...options } : {};
    if (!opts.execPath || !fs.existsSync(opts.execPath)) {
      opts.execPath = resolved;
    }
    return origFork(modulePath, args, opts);
  };
}

patchChildProcessFork();
