# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2026-07-15

### Added

- 包名：`@howie777/mp-ci`（npm 用户 [howie777](https://www.npmjs.com/~howie777)）
- CLI：`mp-ci upload` / `preview` / `doctor`
- 项目配置 `mp-ci.config.cjs`（单项目 / 多项目）
- AppID / 版本自动解析（config → uni manifest → project.config.json）
- 密钥约定：`private.{appid}.key`、`MP_CI_PRIVATE_KEY_PATH`
- Node `child_process.fork` execPath 兜底（`MP_CI_NODE` / `NODE_BINARY`）
- 可选 `preUpload` / `prePreview` 钩子（上传/预览前执行壳命令）
- 配置字段校验与友好报错
- 单元测试（配置解析 / 参数解析）
- GitHub Actions：包自检 + 可选上传示例 workflow

### Notes

- 本包是官方 `miniprogram-ci` 的工程化薄封装，**不负责**小程序构建、审核与发布。
