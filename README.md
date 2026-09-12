# 颂 · Classic Radio

象牙白、酒红与暗金色的古典音乐聆听室。纯静态 HTML / CSS / JavaScript，hls.js 通过固定版本 CDN 加载，无后端、无构建依赖。

## 当前交付状态

- 16 个电台，按英国 / 美国 / 欧洲（国家细分）展示。
- 14 个已配置直播源；France Musique 和 RAI Radio 3 在 2026-09-12 核验时无法取得可验证的直播直链，明确标注“暂时缺少直播源”。
- 单电台播放、切换停止上一台、常驻播放条、搜索与地区筛选、音量、键盘操作、移动端响应式。
- 支持 MSE 的浏览器优先使用 hls.js，其余支持原生 HLS 的 Safari 等浏览器使用原生播放；MP3/AAC 使用 audio。
- 连接/缓冲超时和播放错误可重试，不会阻塞页面。
- **Cloudflare 尚未部署**：执行环境没有继承 `CLOUDFLARE_API_TOKEN`，Wrangler 返回 `You are not authenticated. Please run wrangler login.`；没有创建 Pages 项目、DNS 或自定义域名绑定。

## 本地预览

```sh
npm run dev
```

访问 http://127.0.0.1:4173 。不要直接双击 HTML（浏览器会限制 ES module 的 file:// 加载）。

## 编辑电台

修改 `public/stations.js` 的配置数组即可。`stream: null` 表示缺源；`type: 'hls'` 表示 HLS，其余使用 `audio`。每条记录包含官方页面、核验日期与备注。未来添加电台后，相应更新 `scripts/check.mjs` 中的数量检查。

来源说明可从页面底部“查看直播源与核验记录”访问 `sources.html`。本站不代理、录制或托管任何电台音频。Ö1、RAI Radio 3、BBC Radio 3、WFMT 等也有非古典音乐节目；无法保证全天纯音乐。

## 验证

```sh
npm test
npm run check
```

测试覆盖切台后旧事件不干扰新台、连接中取消、缺源不打断现有播放、音频失败、超时、自动播放拒绝、HLS 销毁/致命错误，以及 hls.js 缺失时 MP3 仍可播放。

## Cloudflare 一键部署与绑定域名

在**已经 export 令牌的同一个终端**，进入此目录后执行：

```sh
npm run deploy
```

不需再次登录。脚本仅从进程环境读取 `CLOUDFLARE_API_TOKEN`，不会打印、存储或上传令牌。令牌需有该账号的 Pages Write、该区域的 Zone Read 和 DNS Write 权限。

脚本会：

1. 检查静态资源与配置。
2. 按 `signupeverywhere.cc` 查询所属账号（不需手填 account ID）。
3. 使用已核对的 Wrangler 4.131.1 创建/复用 `classic-radio` Pages 项目。
4. 上传 `public` 到 main 生产分支，核实部署状态为 success。
5. 关联 `classicradio.signupeverywhere.cc`，若系统未自动生成 DNS 则补充 CNAME；不会覆盖指向其他服务的同名记录。
6. 检查域名激活状态并验证 HTTPS 页面。约两分钟内未激活则明确报告 pending，而不是报告上线成功。

本次按用户要求采用 Direct Upload；GitHub 后续 push 本身不会触发自动部署，修改后再次运行 `npm run deploy`。

若尚未执行部署，等待不会自动使子域名生效。已部署但仍 pending 时，在 Cloudflare → Workers & Pages → classic-radio → Custom domains 检查验证与证书状态，并检查区域 DNS CNAME / CAA。具体时间取决于 DNS 与证书验证结果。

## 官方文档

- [Pages Direct Upload / Wrangler](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Pages 自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Pages 添加域名 API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/subresources/domains/methods/create/)
- [创建 DNS 记录 API](https://developers.cloudflare.com/api/resources/dns/subresources/records/methods/create/)
- [hls.js](https://github.com/video-dev/hls.js)

## 目录

- `public/`：唯一部署目录，含页面、样式、播放器和独立电台数据。
- `scripts/`：本地检查、播放器测试、一键部署脚本，不随静态页面上线。
- `docs/verification.md`：核验范围与限制。

当前目录原有的 `output/`、`outputs/`、`tmp/` 均已忽略，不推送到仓库。
