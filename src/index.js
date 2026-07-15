'use strict';

const { upload } = require('./upload');
const { preview } = require('./preview');
const { doctor } = require('./doctor');
const { resolveProject } = require('./resolve-project');
const { loadConfig } = require('./load-config');
const { defaultSetting } = require('./defaults');

module.exports = {
  upload,
  preview,
  doctor,
  resolveProject,
  loadConfig,
  defaultSetting,
};
