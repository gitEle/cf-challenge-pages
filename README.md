# CF Challenge Demo

一个部署在 Cloudflare Workers 上的演示应用，用于展示 Cloudflare 的三种主要访客验证机制（Challenge）：**Interstitial Challenge Page**、**JavaScript Detection** 和 **Turnstile CAPTCHA**。

每个页面均内置实时**访客指纹面板**，展示 Cloudflare 服务端收集的请求头数据以及浏览器客户端的指纹信息，直观呈现 Challenge 的工作原理。

## 演示路由

| 路径 | Challenge 类型 | 说明 |
|---|---|---|
| `/` | 无 | 首页，介绍各 Challenge 类型及对比 |
| `/resources/public` | 无保护 | 公开资源，作为对比基准页 |
| `/resources/js-protected` | JS Detection | 模拟 JS Challenge 保护场景 |
| `/resources/interstitial` | Interstitial | 模拟 Managed Challenge 全屏拦截场景 |
| `/resources/turnstile` | Turnstile | 嵌入 Turnstile Widget，服务端验证 token |
| `/api/fingerprint` | — | 返回当前请求的 Cloudflare 头信息（JSON） |
| `/static/fingerprint.js` | — | 客户端指纹收集脚本 |

## 指纹面板

每个页面右侧固定展示两类数据：

**Cloudflare 服务端**（从 CF 请求头读取）

- 真实 IP、国家/城市/大洲、ASN、ISP
- Ray ID、设备类型、HTTP 协议
- 威胁评分（Threat Score）、Bot 评分
- 经纬度、时区

**客户端浏览器指纹**（JS 实时收集）

- Canvas 渲染哈希、WebGL 渲染器 + 哈希
- 屏幕分辨率、色深、DPR
- CPU 核心数、设备内存
- 字体检测、插件数量
- AudioContext 哈希
- WebRTC 本地 IP 泄露检测
- Bot 信号检测（WebDriver、Phantom、Selenium 等）

## 项目架构

```
cf-challenge-pages/
├── src/
│   ├── index.ts                 # Worker 入口，路由分发
│   ├── layout.ts                # 共享 HTML 布局（导航栏 + 指纹面板）
│   ├── utils/
│   │   └── cf-headers.ts        # 解析 Cloudflare 请求头工具函数
│   ├── pages/
│   │   ├── home.ts              # 首页
│   │   ├── public.ts            # 公开资源页
│   │   ├── js-protected.ts      # JS Detection 演示页
│   │   ├── interstitial.ts      # Interstitial Challenge 演示页
│   │   └── turnstile.ts         # Turnstile 验证页
│   ├── api/
│   │   ├── fingerprint.ts       # /api/fingerprint 接口
│   │   └── verify.ts            # Turnstile token 服务端验证
│   └── static/
│       └── fingerprint.ts       # 客户端指纹 JS（内联字符串，由 Worker 直接服务）
├── wrangler.toml                # Wrangler 配置（不含密钥）
├── .dev.vars                    # 本地开发环境变量（不部署，已 gitignore）
├── tsconfig.json
└── package.json
```

**技术选型**

- **Cloudflare Workers** — 无服务器运行时，处理路由、读取 CF 请求头、验证 Turnstile token
- **TypeScript** — 类型安全的 Worker 代码
- **Vanilla HTML/CSS/JS** — 零依赖前端，减少加载开销
- **Cloudflare Turnstile** — 服务端验证通过官方 `siteverify` API 完成

## 本地运行

**前提条件**

- Node.js >= 18
- npm >= 9
- Cloudflare 账号（`wrangler dev` 本地模式不需要登录）

**安装依赖**

```bash
npm install
```

**启动开发服务器**

```bash
npm run dev
# 等价于: npx wrangler dev
```

服务器默认监听 `http://localhost:8787`。

本地运行时，Cloudflare 请求头（IP、国家、Ray ID 等）不会注入，指纹面板的服务端部分大多显示 `—`，这是正常现象。部署到 Workers 后才会有完整数据。

**类型检查**

```bash
npm run type-check
```

## 部署到 Cloudflare Workers

**第一步：登录 Cloudflare**

```bash
npx wrangler login
```

**第二步：部署**

```bash
npm run deploy
# 等价于: npx wrangler deploy
```

部署成功后，Wrangler 会输出访问地址，格式为：

```
https://cf-challenge-pages.<your-subdomain>.workers.dev
```

**第三步（可选）：绑定自定义域名**

在 Cloudflare Dashboard → Workers & Pages → 你的 Worker → Settings → Triggers → Custom Domains 中添加域名。

## 配置 Turnstile

### 本地开发

本地开发使用 Cloudflare 官方测试密钥，Turnstile 验证始终通过，无需注册真实账号。测试密钥已配置在 `.dev.vars` 中，`wrangler dev` 自动读取，无需任何额外操作。

```ini
# .dev.vars（仅本地生效，不会被部署，已加入 .gitignore）
TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

### 生产环境

生产环境的密钥通过 Wrangler Secrets 管理，加密存储，不写入代码仓库，也不会出现在 `wrangler.toml` 中。

**第一步：在 Cloudflare Dashboard 创建 Turnstile Site**

前往 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Turnstile → Add Site，获取 **Site Key** 和 **Secret Key**。

**第二步：设置 Secrets**

```bash
npx wrangler secret put TURNSTILE_SITE_KEY
# 按提示输入 Site Key

npx wrangler secret put TURNSTILE_SECRET_KEY
# 按提示输入 Secret Key
```

Secret 设置一次永久生效，后续 `npm run deploy` 不会覆盖，无需重复设置。

**变量优先级说明**

| 来源 | 本地 `wrangler dev` | 生产部署 |
|---|---|---|
| `.dev.vars` | 生效 | 不部署 |
| `wrangler.toml [vars]` | 生效 | 随代码部署（明文） |
| `wrangler secret put` | 不生效 | 生效（加密） |

> 因此本项目将两套密钥完全分离：本地用 `.dev.vars` 测试密钥，生产用 Secrets 真实密钥，互不干扰。

## 配置 WAF 规则（触发真实 Challenge）

本项目的演示页面在本地和 Workers 上**不会自动触发** Cloudflare Challenge——Challenge 由 Cloudflare 网络层在请求到达 Worker 之前拦截，需要在 Dashboard 手动配置 WAF 规则。

前往 **Cloudflare Dashboard → 你的域名 → Security → WAF → Custom Rules**。

**JS Detection（`/resources/js-protected`）**

```
Expression: (http.request.uri.path eq "/resources/js-protected")
Action:     JS Challenge
```

**Interstitial Managed Challenge（`/resources/interstitial`）**

```
Expression: (http.request.uri.path eq "/resources/interstitial")
Action:     Managed Challenge
```

**基于威胁评分触发（进阶）**

```
Expression: (cf.threat_score gt 14) and (http.request.uri.path contains "/resources/")
Action:     Managed Challenge
```

**基于 Bot 评分触发（需开启 Bot Management）**

```
Expression: (cf.bot_management.score lt 30) and (http.request.uri.path eq "/resources/js-protected")
Action:     JS Challenge
```

> WAF 规则配置完成后，使用 `curl` 或无头浏览器访问对应路径，即可看到真实的 Challenge 响应（HTTP 403/503 + Challenge HTML）。

## 环境变量

| 变量 | 说明 | 本地（`.dev.vars`） | 生产（Secrets） |
|---|---|---|---|
| `TURNSTILE_SITE_KEY` | Turnstile 前端 Site Key | 测试 key（始终通过） | 真实 Site Key |
| `TURNSTILE_SECRET_KEY` | Turnstile 后端 Secret Key | 测试 key（始终通过） | 真实 Secret Key |

测试密钥由 Cloudflare 官方提供，不适用于生产环境。
