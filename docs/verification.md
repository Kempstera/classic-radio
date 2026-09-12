# 核验记录

日期：2026-09-12。网络请求来自本机执行环境；有限时长的直播 GET 在收到音频后由超时主动终止，这是直播抽样检查而非下载整个节目。网络成功不等于所有国家和浏览器都能持续播放。

|电台|结果|
|---|---|
|BBC Radio 3|HTTP 200；有效 EXT M3U / EXTINF 清单；CORS *|
|Classic FM UK|HTTP 200；audio/aac；从 Global Player 公开免费配置提取|
|WQXR|HTTP 200；audio/mpeg；浏览器实际进入“正在直播”状态|
|WCRB|HTTP 200；audio/aac；官网播放器公开配置|
|WFMT|HTTP 200；audio/mpeg；wfmt.streamguys1.com/main-mp3|
|KUSC|HTTP 200；audio/mpeg；官网 128.mp3.kusc.live；AAC PLS 也验证成功|
|MPR Classical|HTTP 200；audio/aac；cms 本地电台流|
|All Classical Radio|HTTP 200；audio/mpeg；官方直链|
|WWFM|HTTP 200；audio/mpeg；官方直链|
|Radio Clásica|HTTP 200；有效 EXT M3U / EXTINF 清单；CORS *|
|France Musique|官网与候选直播源连接超时；配置 null|
|BR-KLASSIK|HTTP 200；audio/mpeg；官方 256 kbps 入口|
|Klassik Radio|HTTP 200；audio/mpeg；电台自有域名|
|Ö1|HTTP 200；audio/mpeg；ORF / ORS 直播入口|
|Radio Swiss Classic|HTTP 200；audio/mpeg；官方德语入口|
|RAI Radio 3|官方 radio3.json 返回 live 解析入口；解析请求 Access Denied；配置 null|

## 来源发现

每台官方页面和核验说明保存在 `public/stations.js`，并在 sources.html 展示。BBC CDN 地址来自用户提供的参考项目，按当前日期获取清单验证；Radio Clásica、WFMT、Klassik Radio、Ö1 的候选直链由公开电台目录发现，再对电台或广播服务商端点实测。它们不是声称从官方帮助文档逐字提取的地址。

辅助发现目录：
- https://radio.ssishosting.net/RadioListe.asp （RTVE）
- https://tingfm.com/radio/15005 （WFMT）
- https://www.computerbase.de/forum/threads/radiostream-url-ermitteln-hier-klassik-radio.2118852/ （Klassik Radio）
- https://www.analog-forum.de/wbboard/index.php?thread/189419-streamen-von-radio-wie-am-besten/&pageNo=2 （Ö1）

## 应用验证

- 8 项播放器状态测试通过。
- 16 个唯一电台 ID，14 个 HTTPS 直播源，2 个明确缺源。
- 页面、模块和本地资源语法/引用检查通过。
- 浏览器测试：地区筛选、搜索无结果、重置、播放条在筛选后保持当前电台、WQXR 实际播放、暂停。
- WebMCP 搜索工具：有效输入“维也纳”显示 Ö1；数字输入被拒绝。
- 移动端 390px 视口检查：无横向溢出。

## 发布验证

GitHub 可用，Cloudflare 凭据不可用：

```text
CLOUDFLARE_API_TOKEN present: False
You are not authenticated. Please run wrangler login.
```

Wrangler 最新 CLI（当日解析为 4.131.1）的 `pages project create --help` 和 `pages deploy --help` 已检查，具体命令与官方 Direct Upload 文档一致。部署脚本缺令牌时立即中止；因为缺少凭据，Cloudflare 写入流程尚未执行或实测。
