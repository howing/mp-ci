'use strict';

/**
 * 解析 CLI 参数。
 * 第一个非 flag 位置参数视为 projectKey（多项目配置时使用）。
 */
function parseArgs(argv = process.argv.slice(2)) {
  const result = {
    _: [],
    command: null,
    projectKey: null,
    desc: null,
    robot: null,
    ver: null,
    format: null,
    page: null,
    query: null,
    config: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      result.help = true;
    } else if (arg === '--desc' && argv[i + 1]) {
      result.desc = argv[++i];
    } else if (arg === '--robot' && argv[i + 1]) {
      result.robot = parseInt(argv[++i], 10);
    } else if (arg === '--ver' && argv[i + 1]) {
      result.ver = argv[++i];
    } else if (arg === '--format' && argv[i + 1]) {
      result.format = argv[++i];
    } else if (arg === '--page' && argv[i + 1]) {
      result.page = argv[++i];
    } else if (arg === '--query' && argv[i + 1]) {
      result.query = argv[++i];
    } else if ((arg === '-c' || arg === '--config') && argv[i + 1]) {
      result.config = argv[++i];
    } else if (!arg.startsWith('-')) {
      result._.push(arg);
    }
  }

  if (result._.length > 0) {
    const known = new Set(['upload', 'preview', 'doctor']);
    if (known.has(result._[0])) {
      result.command = result._[0];
      result.projectKey = result._[1] || null;
    } else {
      result.projectKey = result._[0];
    }
  }

  return result;
}

module.exports = { parseArgs };
