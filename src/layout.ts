import type { CFInfo } from './utils/cf-headers';

export interface NavItem {
  path: string;
  label: string;
  badge: string;
  badgeColor: string;
  desc: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: 'Home',
    badge: 'OPEN',
    badgeColor: '#10b981',
    desc: '首页介绍，无任何保护',
  },
  {
    path: '/resources/public',
    label: 'Public Resource',
    badge: 'OPEN',
    badgeColor: '#10b981',
    desc: '公开资源，无 Challenge',
  },
  {
    path: '/resources/js-protected',
    label: 'JS Detection',
    badge: 'JS',
    badgeColor: '#f59e0b',
    desc: '需通过 JavaScript 浏览器检测',
  },
  {
    path: '/resources/interstitial',
    label: 'Interstitial',
    badge: 'MANAGED',
    badgeColor: '#ef4444',
    desc: '触发 Cloudflare Interstitial 拦截页',
  },
  {
    path: '/resources/turnstile',
    label: 'Turnstile',
    badge: 'CAPTCHA',
    badgeColor: '#8b5cf6',
    desc: 'Turnstile CAPTCHA 验证后访问',
  },
];

export function renderLayout(
  currentPath: string,
  title: string,
  content: string,
  cfInfo: CFInfo,
  extraHead = ''
): string {
  const navItems = NAV_ITEMS.map((item) => {
    const isActive = item.path === currentPath;
    return `
      <a href="${item.path}" class="nav-item ${isActive ? 'active' : ''}">
        <span class="nav-badge" style="background:${item.badgeColor}">${item.badge}</span>
        <span class="nav-label">${item.label}</span>
        <span class="nav-desc">${item.desc}</span>
      </a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | CF Challenge Demo</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0f1117;
      --surface: #1a1d27;
      --surface2: #22263a;
      --border: #2d3148;
      --text: #e2e8f0;
      --text-muted: #7c85a2;
      --accent: #f6821f;
      --accent2: #fbad41;
      --green: #10b981;
      --yellow: #f59e0b;
      --red: #ef4444;
      --purple: #8b5cf6;
      --blue: #3b82f6;
      --font: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --mono: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    /* ---- TOP BAR ---- */
    .topbar {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
      height: 56px;
      display: flex;
      align-items: center;
      gap: 12px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .topbar-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 15px;
      color: var(--text);
      text-decoration: none;
    }
    .topbar-logo svg { width: 28px; height: 28px; }
    .topbar-divider { width: 1px; height: 24px; background: var(--border); margin: 0 4px; }
    .topbar-subtitle { color: var(--text-muted); font-size: 13px; }
    /* ---- LAYOUT ---- */
    .app-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    /* ---- SIDEBAR NAV ---- */
    .sidebar {
      width: 260px;
      flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--border);
      padding: 16px 0;
      overflow-y: auto;
      position: sticky;
      top: 56px;
      height: calc(100vh - 56px);
    }
    .sidebar-section-title {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
      padding: 8px 16px 4px;
    }
    .nav-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 10px 16px;
      text-decoration: none;
      border-left: 3px solid transparent;
      transition: all 0.15s;
    }
    .nav-item:hover { background: var(--surface2); border-left-color: var(--border); }
    .nav-item.active { background: var(--surface2); border-left-color: var(--accent); }
    .nav-item-top { display: flex; align-items: center; gap: 8px; }
    .nav-badge {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 2px 5px;
      border-radius: 3px;
      color: #fff;
      font-family: var(--mono);
    }
    .nav-label { font-size: 13px; font-weight: 500; color: var(--text); }
    .nav-desc { font-size: 11px; color: var(--text-muted); padding-left: 2px; line-height: 1.4; }
    /* ---- MAIN CONTENT ---- */
    .main {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
      max-width: 900px;
    }
    /* ---- FINGERPRINT PANEL ---- */
    .fp-panel {
      width: 300px;
      flex-shrink: 0;
      background: var(--surface);
      border-left: 1px solid var(--border);
      overflow-y: auto;
      position: sticky;
      top: 56px;
      height: calc(100vh - 56px);
      padding: 16px;
    }
    .fp-section { margin-bottom: 20px; }
    .fp-section-title {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .fp-section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    .fp-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      padding: 4px 0;
      border-bottom: 1px solid var(--border);
      font-size: 11px;
    }
    .fp-row:last-child { border-bottom: none; }
    .fp-key { color: var(--text-muted); flex-shrink: 0; min-width: 80px; }
    .fp-val {
      color: var(--text);
      font-family: var(--mono);
      font-size: 10.5px;
      text-align: right;
      word-break: break-all;
    }
    .fp-val.good { color: var(--green); }
    .fp-val.warn { color: var(--yellow); }
    .fp-val.bad { color: var(--red); }
    .fp-loading { color: var(--text-muted); font-size: 11px; font-style: italic; }
    /* ---- CARD ---- */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .card-desc { color: var(--text-muted); font-size: 13px; line-height: 1.6; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .badge-green { background: rgba(16,185,129,0.15); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }
    .badge-yellow { background: rgba(245,158,11,0.15); color: var(--yellow); border: 1px solid rgba(245,158,11,0.3); }
    .badge-red { background: rgba(239,68,68,0.15); color: var(--red); border: 1px solid rgba(239,68,68,0.3); }
    .badge-purple { background: rgba(139,92,246,0.15); color: var(--purple); border: 1px solid rgba(139,92,246,0.3); }
    .badge-blue { background: rgba(59,130,246,0.15); color: var(--blue); border: 1px solid rgba(59,130,246,0.3); }
    .code-block {
      background: #0d1117;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 14px 16px;
      font-family: var(--mono);
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
      margin-top: 12px;
      color: #a8b4c8;
    }
    .code-block .kw { color: #ff79c6; }
    .code-block .str { color: #f1fa8c; }
    .code-block .comment { color: #6272a4; }
    .code-block .val { color: #50fa7b; }
    h2 { font-size: 22px; font-weight: 700; margin-bottom: 16px; }
    h3 { font-size: 15px; font-weight: 600; margin: 20px 0 8px; color: var(--text); }
    p { color: var(--text-muted); font-size: 13px; line-height: 1.7; margin-bottom: 10px; }
    ul { padding-left: 18px; }
    ul li { color: var(--text-muted); font-size: 13px; line-height: 1.8; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .step {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      align-items: flex-start;
    }
    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--accent);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .step-content { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
    .step-content strong { color: var(--text); }
    @media (max-width: 900px) {
      .fp-panel { display: none; }
      .sidebar { display: none; }
      .main { padding: 16px; }
    }
  </style>
  ${extraHead}
</head>
<body>
  <header class="topbar">
    <a href="/" class="topbar-logo">
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="14" fill="#F6821F"/>
        <path d="M19.5 17.5c.4-1.3.2-2.4-.5-3.2-.6-.7-1.6-1.1-2.8-1.1l-.3-.1c-.1-.5-.4-1-.8-1.4-.5-.5-1.2-.8-1.9-.8-.8 0-1.5.3-2 .9-.3.3-.5.7-.6 1.1h-.1c-.9 0-1.7.4-2.2 1-.4.5-.6 1.2-.5 2 0 .1 0 .1.1.2H19.4c.1-.1.1-.1.1-.2v-.4z" fill="white"/>
      </svg>
      CF Challenge Demo
    </a>
    <div class="topbar-divider"></div>
    <span class="topbar-subtitle">Cloudflare Challenge Types 演示</span>
  </header>
  <div class="app-body">
    <nav class="sidebar">
      <div class="sidebar-section-title">页面路由</div>
      ${navItems}
    </nav>
    <main class="main">
      ${content}
    </main>
    <aside class="fp-panel" id="fp-panel">
      <div class="fp-section">
        <div class="fp-section-title">Cloudflare 服务端</div>
        <div id="cf-fp">
          <div class="fp-row">
            <span class="fp-key">IP</span>
            <span class="fp-val">${cfInfo.ip}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">国家</span>
            <span class="fp-val">${cfInfo.country}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">城市</span>
            <span class="fp-val">${cfInfo.city}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">大洲</span>
            <span class="fp-val">${cfInfo.continent}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">ASN</span>
            <span class="fp-val">${cfInfo.asn}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">ISP</span>
            <span class="fp-val">${cfInfo.isp}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">Ray ID</span>
            <span class="fp-val" style="color:#f59e0b">${cfInfo.rayId}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">设备类型</span>
            <span class="fp-val">${cfInfo.deviceType}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">协议</span>
            <span class="fp-val">${cfInfo.tlsVersion}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">威胁评分</span>
            <span class="fp-val" id="threat-score">${cfInfo.threatScore}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">Bot 评分</span>
            <span class="fp-val" id="bot-score">${cfInfo.botScore}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">时区</span>
            <span class="fp-val">${cfInfo.timezone}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">经纬度</span>
            <span class="fp-val">${cfInfo.latitude}, ${cfInfo.longitude}</span>
          </div>
        </div>
      </div>
      <div class="fp-section">
        <div class="fp-section-title">客户端指纹</div>
        <div id="client-fp">
          <div class="fp-loading">收集中...</div>
        </div>
      </div>
      <div class="fp-section">
        <div class="fp-section-title">Bot 检测信号</div>
        <div id="bot-signals">
          <div class="fp-loading">分析中...</div>
        </div>
      </div>
    </aside>
  </div>
  <script src="/static/fingerprint.js"></script>
</body>
</html>`;
}
