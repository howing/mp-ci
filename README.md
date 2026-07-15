# @howie777/mp-ci

个人维护的微信小程序 **上传 / 预览** CLI，基于官方 [`miniprogram-ci`](https://www.npmjs.com/package/miniprogram-ci) 做薄封装。

**做什么：** `upload` / `preview` / `doctor`、配置约定、密钥约定、uni manifest 解析、Node fork 路径兜底、可选构建钩子。

**不做什么：** 不负责小程序构建内核、审核、发布；也不替代微信开发者工具的全部能力。

## 安装

```bash
npm i -D @howie777/mp-ci miniprogram-ci
```

`miniprogram-ci` 为 **peerDependency**（`>=2 <3`），请一并安装；也可写在 `devDependencies` 里便于锁版本。

本地或 Git：

```bash
npm i -D file:../mp-ci miniprogram-ci
# 或
npm i -D git+https://github.com/howing/mp-ci.git#v1.0.0 miniprogram-ci
```

## 配置

在项目根目录创建 `mp-ci.config.cjs`：

```js
module.exports = {
  name: '我的小程序',
  projectPath: 'dist/build/mp-weixin', // 已构建产物，需含 project.config.json
  manifestPath: 'src/manifest.json',   // uni-app：读 appid / versionName
  privateKeyDir: 'ci/keys',            // private.{appid}.key
  qrcodeDir: 'ci/preview',
  // 可选：上传/预览前执行
  // preUpload: 'npm run build:mp-weixin',
  // prePreview: 'npm run build:mp-weixin',
};
```

### 多项目

```js
module.exports = {
  defaultProject: 'app',
  privateKeyDir: 'ci/keys',
  projects: {
    app: {
      name: '我的小程序',
      projectPath: 'dist/build/mp-weixin',
      manifestPath: 'src/manifest.json',
      preUpload: 'npm run build:mp-weixin',
    },
  },
};
```

### 解析顺序

| 字段 | 顺序 |
|------|------|
| AppID | `config.appid` → `manifest.mp-weixin.appid` → `project.config.json` |
| 版本 | CLI `--ver` → `config.version` → `manifest.versionName` → `1.0.0` |
| 密钥 | `MP_CI_PRIVATE_KEY_PATH` → `privateKeyPath` → `privateKeyDir/private.{appid}.key` |

密钥不要提交进 Git；微信公众平台需配置 IP 白名单。

## 使用

```json
{
  "scripts": {
    "ci:upload": "mp-ci upload",
    "ci:preview": "mp-ci preview --format terminal",
    "ci:doctor": "mp-ci doctor"
  }
}
```

```bash
mp-ci upload --desc "修复裂图" --ver 1.0.5 --robot 1
mp-ci preview app --format terminal
mp-ci preview --page pages/detail/detail --query id=25
mp-ci doctor
```

### 环境变量

| 变量 | 说明 |
|------|------|
| `MP_CI_PRIVATE_KEY_PATH` | 私钥路径 |
| `MP_CI_NODE` / `NODE_BINARY` | fork 子进程使用的 node（修复 execPath ENOENT） |

## GitHub Actions

包自检见 [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)。在你自己的项目里上传可参考 [`examples/github-action-upload.yml`](./examples/github-action-upload.yml)。

## 发布

```bash
npm login
npm whoami   # howie777
npm publish
```

本仓库已通过 `.npmrc` / `publishConfig` 固定使用 [npmjs.com](https://www.npmjs.com/) 官方源。

## 开发

```bash
npm install
npm test
node bin/mp-ci.js --help
```

## License

[MIT](./LICENSE)
