var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-Tgabqe/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/utils/cf-headers.ts
function parseCFHeaders(request) {
  const h = /* @__PURE__ */ __name((name) => request.headers.get(name) ?? "\u2014", "h");
  const visitor = h("CF-Visitor");
  let tlsVersion = "\u2014";
  try {
    const parsed = JSON.parse(visitor);
    tlsVersion = parsed.scheme === "https" ? "HTTPS" : "HTTP";
  } catch {
  }
  return {
    ip: h("CF-Connecting-IP"),
    country: h("CF-IPCountry"),
    city: h("CF-IPCity"),
    region: h("CF-IPRegion"),
    continent: h("CF-IPContinent"),
    asn: h("CF-ASN"),
    isp: h("CF-ISP"),
    rayId: h("CF-Ray"),
    deviceType: h("CF-Device-Type"),
    tlsVersion,
    httpProtocol: request.cf?.httpProtocol ?? h("CF-Version-Beta") ?? "\u2014",
    threatScore: request.cf?.threatScore?.toString() ?? "\u2014",
    botScore: request.cf?.botManagement?.score?.toString() ?? "\u2014",
    latitude: request.cf?.latitude ?? "\u2014",
    longitude: request.cf?.longitude ?? "\u2014",
    postalCode: request.cf?.postalCode ?? "\u2014",
    timezone: request.cf?.timezone ?? "\u2014"
  };
}
__name(parseCFHeaders, "parseCFHeaders");

// src/layout.ts
var NAV_ITEMS = [
  {
    path: "/",
    label: "Home",
    badge: "OPEN",
    badgeColor: "#10b981",
    desc: "\u9996\u9875\u4ECB\u7ECD\uFF0C\u65E0\u4EFB\u4F55\u4FDD\u62A4"
  },
  {
    path: "/resources/public",
    label: "Public Resource",
    badge: "OPEN",
    badgeColor: "#10b981",
    desc: "\u516C\u5F00\u8D44\u6E90\uFF0C\u65E0 Challenge"
  },
  {
    path: "/resources/js-protected",
    label: "JS Detection",
    badge: "JS",
    badgeColor: "#f59e0b",
    desc: "\u9700\u901A\u8FC7 JavaScript \u6D4F\u89C8\u5668\u68C0\u6D4B"
  },
  {
    path: "/resources/interstitial",
    label: "Interstitial",
    badge: "MANAGED",
    badgeColor: "#ef4444",
    desc: "\u89E6\u53D1 Cloudflare Interstitial \u62E6\u622A\u9875"
  },
  {
    path: "/resources/turnstile",
    label: "Turnstile",
    badge: "CAPTCHA",
    badgeColor: "#8b5cf6",
    desc: "Turnstile CAPTCHA \u9A8C\u8BC1\u540E\u8BBF\u95EE"
  }
];
function renderLayout(currentPath, title, content, cfInfo, extraHead = "") {
  const navItems = NAV_ITEMS.map((item) => {
    const isActive = item.path === currentPath;
    return `
      <a href="${item.path}" class="nav-item ${isActive ? "active" : ""}">
        <span class="nav-badge" style="background:${item.badgeColor}">${item.badge}</span>
        <span class="nav-label">${item.label}</span>
        <span class="nav-desc">${item.desc}</span>
      </a>`;
  }).join("");
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
    <span class="topbar-subtitle">Cloudflare Challenge Types \u6F14\u793A</span>
  </header>
  <div class="app-body">
    <nav class="sidebar">
      <div class="sidebar-section-title">\u9875\u9762\u8DEF\u7531</div>
      ${navItems}
    </nav>
    <main class="main">
      ${content}
    </main>
    <aside class="fp-panel" id="fp-panel">
      <div class="fp-section">
        <div class="fp-section-title">Cloudflare \u670D\u52A1\u7AEF</div>
        <div id="cf-fp">
          <div class="fp-row">
            <span class="fp-key">IP</span>
            <span class="fp-val">${cfInfo.ip}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">\u56FD\u5BB6</span>
            <span class="fp-val">${cfInfo.country}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">\u57CE\u5E02</span>
            <span class="fp-val">${cfInfo.city}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">\u5927\u6D32</span>
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
            <span class="fp-key">\u8BBE\u5907\u7C7B\u578B</span>
            <span class="fp-val">${cfInfo.deviceType}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">\u534F\u8BAE</span>
            <span class="fp-val">${cfInfo.tlsVersion}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">\u5A01\u80C1\u8BC4\u5206</span>
            <span class="fp-val" id="threat-score">${cfInfo.threatScore}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">Bot \u8BC4\u5206</span>
            <span class="fp-val" id="bot-score">${cfInfo.botScore}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">\u65F6\u533A</span>
            <span class="fp-val">${cfInfo.timezone}</span>
          </div>
          <div class="fp-row">
            <span class="fp-key">\u7ECF\u7EAC\u5EA6</span>
            <span class="fp-val">${cfInfo.latitude}, ${cfInfo.longitude}</span>
          </div>
        </div>
      </div>
      <div class="fp-section">
        <div class="fp-section-title">\u5BA2\u6237\u7AEF\u6307\u7EB9</div>
        <div id="client-fp">
          <div class="fp-loading">\u6536\u96C6\u4E2D...</div>
        </div>
      </div>
      <div class="fp-section">
        <div class="fp-section-title">Bot \u68C0\u6D4B\u4FE1\u53F7</div>
        <div id="bot-signals">
          <div class="fp-loading">\u5206\u6790\u4E2D...</div>
        </div>
      </div>
    </aside>
  </div>
  <script src="/static/fingerprint.js"><\/script>
</body>
</html>`;
}
__name(renderLayout, "renderLayout");

// src/pages/home.ts
function homePage(cfInfo) {
  const content = `
    <h2>Cloudflare Challenge Types \u6F14\u793A</h2>
    <p>\u672C\u7AD9\u6F14\u793A Cloudflare \u63D0\u4F9B\u7684\u4E09\u79CD\u4E3B\u8981\u8BBF\u5BA2\u9A8C\u8BC1\u673A\u5236\uFF08Challenge\uFF09\uFF0C\u5E2E\u52A9\u4F60\u7406\u89E3\u5B83\u4EEC\u7684\u5DE5\u4F5C\u539F\u7406\u3001\u89E6\u53D1\u6761\u4EF6\u548C\u914D\u7F6E\u65B9\u5F0F\u3002</p>

    <div class="card" style="border-color: rgba(246,130,31,0.4); background: rgba(246,130,31,0.05);">
      <div class="card-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#f6821f"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        \u5173\u4E8E\u53F3\u4FA7\u6307\u7EB9\u9762\u677F
      </div>
      <div class="card-desc">
        \u53F3\u4FA7\u5B9E\u65F6\u663E\u793A\u4E24\u7C7B\u6570\u636E\uFF1A<br>
        <strong style="color:#e2e8f0">Cloudflare \u670D\u52A1\u7AEF</strong> \u2014 Worker \u4ECE\u8BF7\u6C42\u5934\u8BFB\u53D6\u7684 CF \u6570\u636E\uFF0C\u5305\u62EC\u4F60\u7684 IP\u3001Ray ID\u3001\u5A01\u80C1\u8BC4\u5206\u7B49\uFF0C\u8FD9\u662F CF \u5224\u65AD\u662F\u5426\u89E6\u53D1 Challenge \u7684\u4F9D\u636E\u3002<br><br>
        <strong style="color:#e2e8f0">\u5BA2\u6237\u7AEF\u6307\u7EB9</strong> \u2014 \u6D4F\u89C8\u5668 JS \u6536\u96C6\u7684\u4FE1\u53F7\uFF0CCanvas Hash\u3001WebGL\u3001\u786C\u4EF6\u4FE1\u606F\u7B49\uFF0C\u8FD9\u6B63\u662F <em>JS Detection</em> Challenge \u6240\u68C0\u6D4B\u7684\u5185\u5BB9\u3002
      </div>
    </div>

    <div class="card">
      <div class="card-title">
        <span class="badge badge-green">1</span>
        Interstitial Challenge Page
      </div>
      <div class="card-desc">
        Cloudflare \u5728\u8BF7\u6C42\u5230\u8FBE\u6E90\u7AD9\u4E4B\u524D\u63D2\u5165\u4E00\u4E2A\u5168\u5C4F\u62E6\u622A\u9875\uFF0C\u8981\u6C42\u8BBF\u5BA2\u8BC1\u660E\u81EA\u5DF1\u662F\u4EBA\u7C7B\u3002\u5178\u578B\u573A\u666F\u662F WAF \u89C4\u5219\u89E6\u53D1 <code>Managed Challenge</code> \u6216 <code>JS Challenge</code>\u3002
      </div>
      <a href="/resources/interstitial" style="display:inline-block;margin-top:12px;padding:8px 16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;color:#ef4444;font-size:13px;">
        \u524D\u5F80\u6F14\u793A \u2192
      </a>
    </div>

    <div class="card">
      <div class="card-title">
        <span class="badge badge-yellow">2</span>
        JavaScript Detection
      </div>
      <div class="card-desc">
        Cloudflare \u4E0B\u53D1\u4E00\u6BB5 JS Challenge\uFF0C\u6D4F\u89C8\u5668\u5FC5\u987B\u6267\u884C\u5B8C\u6210\u540E\u624D\u80FD\u8BBF\u95EE\u5185\u5BB9\u3002\u65E0\u6CD5\u8FD0\u884C JS \u7684\u722C\u866B\u3001curl \u7B49\u5DE5\u5177\u4F1A\u88AB\u963B\u6B62\u3002\u53F3\u4FA7\u9762\u677F\u5C55\u793A\u4E86 CF \u4F1A\u6536\u96C6\u54EA\u4E9B JS \u4FE1\u53F7\u3002
      </div>
      <a href="/resources/js-protected" style="display:inline-block;margin-top:12px;padding:8px 16px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:6px;color:#f59e0b;font-size:13px;">
        \u524D\u5F80\u6F14\u793A \u2192
      </a>
    </div>

    <div class="card">
      <div class="card-title">
        <span class="badge badge-purple">3</span>
        Turnstile CAPTCHA
      </div>
      <div class="card-desc">
        Cloudflare Turnstile \u662F\u65B0\u4E00\u4EE3 CAPTCHA \u66FF\u4EE3\u65B9\u6848\uFF0C\u5927\u591A\u6570\u771F\u5B9E\u7528\u6237\u65E0\u9700\u4E0E widget \u4EA4\u4E92\u5373\u53EF\u901A\u8FC7\u9A8C\u8BC1\u3002\u540E\u7AEF\u901A\u8FC7\u9A8C\u8BC1 token \u6765\u786E\u8BA4\u8BBF\u5BA2\u5408\u6CD5\u6027\u3002
      </div>
      <a href="/resources/turnstile" style="display:inline-block;margin-top:12px;padding:8px 16px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:6px;color:#8b5cf6;font-size:13px;">
        \u524D\u5F80\u6F14\u793A \u2192
      </a>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;color:#7c85a2;">Challenge \u5BF9\u6BD4</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px;">
        <thead>
          <tr style="border-bottom:1px solid #2d3148;">
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;">\u7C7B\u578B</th>
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;">\u7528\u6237\u4F53\u9A8C</th>
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;">\u89E6\u53D1\u65B9\u5F0F</th>
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;">\u9002\u7528\u573A\u666F</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #2d3148;">
            <td style="padding:6px 8px;"><span class="badge badge-red">Interstitial</span></td>
            <td style="padding:6px 8px;color:#7c85a2;">\u5168\u5C4F\u62E6\u622A\u9875</td>
            <td style="padding:6px 8px;color:#7c85a2;">WAF \u89C4\u5219</td>
            <td style="padding:6px 8px;color:#7c85a2;">\u9AD8\u98CE\u9669\u8DEF\u7531\u4FDD\u62A4</td>
          </tr>
          <tr style="border-bottom:1px solid #2d3148;">
            <td style="padding:6px 8px;"><span class="badge badge-yellow">JS Detection</span></td>
            <td style="padding:6px 8px;color:#7c85a2;">\u81EA\u52A8\u901A\u8FC7</td>
            <td style="padding:6px 8px;color:#7c85a2;">WAF / Bot Management</td>
            <td style="padding:6px 8px;color:#7c85a2;">\u9632\u722C\u866B</td>
          </tr>
          <tr>
            <td style="padding:6px 8px;"><span class="badge badge-purple">Turnstile</span></td>
            <td style="padding:6px 8px;color:#7c85a2;">Widget \u5D4C\u5165</td>
            <td style="padding:6px 8px;color:#7c85a2;">\u5F00\u53D1\u8005\u96C6\u6210</td>
            <td style="padding:6px 8px;color:#7c85a2;">\u8868\u5355/\u5185\u5BB9\u4FDD\u62A4</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
  return renderLayout("/", "Home", content, cfInfo);
}
__name(homePage, "homePage");

// src/pages/public.ts
function publicPage(cfInfo) {
  const content = `
    <h2>Public Resource <span class="badge badge-green" style="vertical-align:middle;font-size:14px;">\u65E0\u4FDD\u62A4</span></h2>
    <p>\u6B64\u9875\u9762\u6CA1\u6709\u4EFB\u4F55 Challenge \u4FDD\u62A4\uFF0C\u6240\u6709\u8BBF\u5BA2\u5747\u53EF\u76F4\u63A5\u8BBF\u95EE\u3002\u8FD9\u662F\u5BF9\u6BD4\u57FA\u51C6\u9875\u9762\u3002</p>

    <div class="card" style="border-color:rgba(16,185,129,0.3);">
      <div class="card-title" style="color:#10b981;">\u516C\u5F00\u6587\u6863\u8D44\u6E90</div>
      <div class="card-desc">
        \u4F60\u5DF2\u6210\u529F\u8BBF\u95EE\u6B64\u516C\u5F00\u8D44\u6E90\u3002\u6CE8\u610F\u53F3\u4FA7\u9762\u677F\u2014\u2014\u5373\u4F7F\u6CA1\u6709\u4EFB\u4F55 Challenge\uFF0CCloudflare \u4F9D\u7136\u4F1A\u8BB0\u5F55\u4F60\u7684\u6307\u7EB9\u4FE1\u606F\u5E76\u6301\u7EED\u5206\u6790\u5A01\u80C1\u8BC4\u5206\u3002
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">WAF \u89C4\u5219\u914D\u7F6E\uFF08\u65E0\u4FDD\u62A4\uFF09</div>
      <div class="code-block">
<span class="comment"># \u6B64\u8DEF\u7531\u4E0D\u9700\u8981\u4EFB\u4F55 WAF \u89C4\u5219</span>
<span class="comment"># Cloudflare Dashboard \u2192 Security \u2192 WAF \u2192 Custom Rules</span>

<span class="kw">Rule:</span> <span class="str">Allow /resources/public</span>
<span class="kw">Expression:</span> <span class="val">(http.request.uri.path eq "/resources/public")</span>
<span class="kw">Action:</span> <span class="str">Allow</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">\u6B64\u9875\u9762\u5DE5\u4F5C\u539F\u7406</div>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-content"><strong>\u6D4F\u89C8\u5668\u53D1\u8D77\u8BF7\u6C42</strong> \u2192 Cloudflare \u8FB9\u7F18\u8282\u70B9\u63A5\u6536</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-content"><strong>CF \u68C0\u67E5\u5A01\u80C1\u8BC4\u5206</strong>\uFF1A\u4F4E\u4E8E\u9608\u503C\u5219\u76F4\u63A5\u653E\u884C</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-content"><strong>\u8BF7\u6C42\u8F6C\u53D1</strong> \u5230 Worker\uFF0C\u8FD4\u56DE\u9875\u9762\u5185\u5BB9</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-content"><strong>\u53F3\u4FA7\u6307\u7EB9\u9762\u677F</strong>\u5C55\u793A CF \u5728\u6B64\u8FC7\u7A0B\u4E2D\u6536\u96C6\u7684\u6240\u6709\u4FE1\u606F</div>
      </div>
    </div>

    <p style="color:#7c85a2;font-size:12px;">
      \u5BF9\u6BD4\uFF1A<a href="/resources/js-protected">\u8BBF\u95EE\u53D7 JS Detection \u4FDD\u62A4\u7684\u9875\u9762</a> \u67E5\u770B\u5DEE\u5F02\u3002
    </p>
  `;
  return renderLayout("/resources/public", "Public Resource", content, cfInfo);
}
__name(publicPage, "publicPage");

// src/pages/js-protected.ts
function jsProtectedPage(cfInfo) {
  const content = `
    <h2>JavaScript Detection <span class="badge badge-yellow" style="vertical-align:middle;font-size:14px;">JS Challenge</span></h2>
    <p>
      \u6B64\u9875\u9762\u6A21\u62DF Cloudflare <strong>JS Challenge</strong> \u4FDD\u62A4\u573A\u666F\u3002\u5728\u771F\u5B9E\u90E8\u7F72\u4E2D\uFF0CCloudflare \u8FB9\u7F18\u8282\u70B9\u4F1A\u5728\u8FD4\u56DE\u6B64\u5185\u5BB9\u4E4B\u524D\uFF0C\u5148\u5411\u6D4F\u89C8\u5668\u4E0B\u53D1\u4E00\u4E2A JavaScript \u8BA1\u7B97\u6311\u6218\u3002
    </p>

    <div class="card" style="border-color:rgba(245,158,11,0.3);">
      <div class="card-title" style="color:#f59e0b;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        \u4F60\u6B63\u5728\u6D4F\u89C8\u53D7\u4FDD\u62A4\u5185\u5BB9
      </div>
      <div class="card-desc">
        \u5728\u751F\u4EA7\u73AF\u5883\u4E2D\uFF0C\u5982\u679C\u4F60\u4F7F\u7528 <code>curl</code>\u3001\u65E0\u5934\u6D4F\u89C8\u5668\u6216\u7981\u7528 JS \u7684\u5BA2\u6237\u7AEF\u8BBF\u95EE\uFF0C\u5C06\u4F1A\u770B\u5230 Cloudflare \u7684 JS Challenge \u9875\u9762\u800C\u4E0D\u662F\u8FD9\u91CC\u7684\u5185\u5BB9\u3002
        <br><br>
        \u53F3\u4FA7 <strong>"Bot \u68C0\u6D4B\u4FE1\u53F7"</strong> \u9762\u677F\u5C55\u793A\u4E86 Cloudflare \u5B9E\u9645\u68C0\u6D4B\u7684\u5BA2\u6237\u7AEF\u7279\u5F81\u3002
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">JS Detection \u5DE5\u4F5C\u539F\u7406</div>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-content"><strong>CF \u4E0B\u53D1\u6311\u6218\u9875</strong>\uFF1A\u8FD4\u56DE\u4E00\u4E2A\u5305\u542B JS \u8BA1\u7B97\u4EFB\u52A1\u7684 HTML\uFF0C\u800C\u975E\u76EE\u6807\u5185\u5BB9</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-content"><strong>\u6D4F\u89C8\u5668\u6267\u884C JS</strong>\uFF1A\u5B8C\u6210 CPU \u5BC6\u96C6\u578B\u8BA1\u7B97\uFF08\u5982 Proof of Work\uFF09</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-content"><strong>\u6536\u96C6\u73AF\u5883\u4FE1\u53F7</strong>\uFF1ACanvas\u3001WebGL\u3001\u65F6\u533A\u3001\u63D2\u4EF6\u3001\u5B57\u4F53\u7B49\uFF08\u89C1\u53F3\u4FA7\u9762\u677F\uFF09</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-content"><strong>\u63D0\u4EA4\u7ED3\u679C</strong>\uFF1A\u6D4F\u89C8\u5668\u643A\u5E26\u8BA1\u7B97\u7ED3\u679C\u91CD\u65B0\u8BF7\u6C42\uFF0CCF \u9A8C\u8BC1\u901A\u8FC7\u540E\u8BBE\u7F6E Cookie</div>
      </div>
      <div class="step">
        <div class="step-num">5</div>
        <div class="step-content"><strong>\u8BBF\u95EE\u653E\u884C</strong>\uFF1A\u540E\u7EED\u8BF7\u6C42\u643A\u5E26 CF \u9A8C\u8BC1 Cookie\uFF0C\u65E0\u9700\u91CD\u590D\u9A8C\u8BC1</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">WAF \u89C4\u5219\u914D\u7F6E</div>
      <div class="code-block">
<span class="comment"># Cloudflare Dashboard \u2192 Security \u2192 WAF \u2192 Custom Rules</span>

<span class="kw">Rule Name:</span> <span class="str">JS Challenge - Protected Resources</span>
<span class="kw">Expression:</span>
  <span class="val">(http.request.uri.path eq "/resources/js-protected")</span>
<span class="kw">Action:</span> <span class="str">JS Challenge</span>

<span class="comment"># \u6216\u8005\u4F7F\u7528 Bot Management \u7684\u81EA\u52A8\u6A21\u5F0F:</span>
<span class="kw">Expression:</span>
  <span class="val">(cf.bot_management.score lt 30)</span>
  <span class="val">and (http.request.uri.path eq "/resources/js-protected")</span>
<span class="kw">Action:</span> <span class="str">JS Challenge</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">\u7528 curl \u6D4B\u8BD5\uFF08\u4F1A\u88AB\u62E6\u622A\uFF09</div>
      <div class="code-block">
<span class="comment"># \u4F7F\u7528 curl \u8BBF\u95EE\u6B64\u9875\u9762\uFF0C\u5728\u771F\u5B9E\u90E8\u7F72\u4E2D\u5C06\u8FD4\u56DE CF JS Challenge \u9875</span>
$ <span class="val">curl -s https://your-worker.workers.dev/resources/js-protected</span>

<span class="comment"># \u54CD\u5E94\u4F1A\u662F\u4E00\u4E2A HTML challenge \u9875\uFF0C\u800C\u4E0D\u662F\u5185\u5BB9</span>
<span class="comment"># HTTP \u72B6\u6001\u7801: 403 \u6216 503</span>
      </div>
    </div>
  `;
  return renderLayout("/resources/js-protected", "JS Detection", content, cfInfo);
}
__name(jsProtectedPage, "jsProtectedPage");

// src/pages/interstitial.ts
function interstitialPage(cfInfo) {
  const content = `
    <h2>Interstitial Challenge Page <span class="badge badge-red" style="vertical-align:middle;font-size:14px;">MANAGED CHALLENGE</span></h2>
    <p>
      Interstitial Challenge \u662F Cloudflare \u6700\u5F3A\u7684\u524D\u7F6E\u9A8C\u8BC1\u673A\u5236\u2014\u2014\u5728\u8BF7\u6C42\u5230\u8FBE\u6E90\u7AD9\u4E4B\u524D\uFF0C\u4F1A\u663E\u793A\u4E00\u4E2A<strong>\u5168\u5C4F\u62E6\u622A\u9875\u9762</strong>\uFF0C\u8981\u6C42\u8BBF\u5BA2\u5B8C\u6210\u9A8C\u8BC1\u3002
    </p>

    <div class="card" style="border-color:rgba(239,68,68,0.3);">
      <div class="card-title" style="color:#ef4444;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        \u4F60\u5DF2\u901A\u8FC7 Interstitial Challenge
      </div>
      <div class="card-desc">
        \u5728\u751F\u4EA7\u73AF\u5883\u4E2D\uFF0C\u8BBF\u95EE\u6B64\u9875\u9762\u7684\u7528\u6237\u9996\u5148\u4F1A\u770B\u5230 Cloudflare \u7684\u5168\u5C4F\u9A8C\u8BC1\u9875\uFF0C\u5B8C\u6210\u540E\u624D\u80FD\u770B\u5230\u6B64\u5185\u5BB9\u3002\u4F60\u73B0\u5728\u770B\u5230\u8FD9\u91CC\uFF0C\u8BF4\u660E\u4F60\u7684\u6D4F\u89C8\u5668\u5DF2\u901A\u8FC7\u4E86\u9A8C\u8BC1\uFF08\u6216\u672C\u5730\u5F00\u53D1\u6A21\u5F0F\u4E0B\u8DF3\u8FC7\u4E86\u9A8C\u8BC1\uFF09\u3002
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">\u4E09\u79CD Interstitial Challenge \u7C7B\u578B</div>

      <h3 style="color:#f59e0b;">1. JS Challenge\uFF08\u6700\u8F7B\u91CF\uFF09</h3>
      <p>\u6D4F\u89C8\u5668\u5728\u540E\u53F0\u5B8C\u6210 JavaScript \u8BA1\u7B97\uFF0C\u901A\u5E38\u7528\u6237\u51E0\u4E4E\u611F\u77E5\u4E0D\u5230\u3002\u9002\u7528\u4E8E\u8F7B\u5EA6\u4FDD\u62A4\u3002</p>

      <h3 style="color:#ef4444;">2. Managed Challenge\uFF08\u63A8\u8350\uFF09</h3>
      <p>Cloudflare \u81EA\u52A8\u5224\u65AD\u98CE\u9669\u7B49\u7EA7\uFF1A\u4F4E\u98CE\u9669\u7528\u6237\u81EA\u52A8\u901A\u8FC7\uFF0C\u9AD8\u98CE\u9669\u7528\u6237\u663E\u793A CAPTCHA\u3002\u8FD9\u662F CF \u5B98\u65B9\u63A8\u8350\u7684\u6700\u4F73\u5B9E\u8DF5\u3002</p>

      <h3 style="color:#8b5cf6;">3. Interactive Challenge\uFF08\u6700\u4E25\u683C\uFF09</h3>
      <p>\u5F3A\u5236\u663E\u793A\u53EF\u4EA4\u4E92\u7684 CAPTCHA\uFF0C\u6240\u6709\u7528\u6237\u90FD\u9700\u8981\u624B\u52A8\u5B8C\u6210\u3002\u9002\u7528\u4E8E\u6700\u9AD8\u5B89\u5168\u8981\u6C42\u573A\u666F\u3002</p>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">Interstitial \u9875\u9762\u957F\u4EC0\u4E48\u6837</div>
      <div style="background:#0d1117;border:1px solid #2d3148;border-radius:8px;padding:24px;text-align:center;margin-top:8px;">
        <div style="background:#f6821f;width:40px;height:40px;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="white"><path d="M19.5 17.5c.4-1.3.2-2.4-.5-3.2-.6-.7-1.6-1.1-2.8-1.1l-.3-.1c-.1-.5-.4-1-.8-1.4-.5-.5-1.2-.8-1.9-.8-.8 0-1.5.3-2 .9-.3.3-.5.7-.6 1.1h-.1c-.9 0-1.7.4-2.2 1-.4.5-.6 1.2-.5 2 0 .1 0 .1.1.2H19.4c.1-.1.1-.1.1-.2v-.4z"/></svg>
        </div>
        <div style="color:#e2e8f0;font-size:15px;font-weight:600;margin-bottom:6px;">Checking if the site connection is secure</div>
        <div style="color:#7c85a2;font-size:12px;margin-bottom:16px;">example.com needs to review the security of your connection before proceeding.</div>
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(246,130,31,0.1);border:1px solid rgba(246,130,31,0.3);padding:8px 16px;border-radius:6px;">
          <div style="width:16px;height:16px;border:2px solid #f6821f;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
          <span style="color:#f6821f;font-size:12px;">Verifying you are human...</span>
        </div>
        <div style="color:#4a5568;font-size:10px;margin-top:12px;">Performance & security by Cloudflare</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">WAF \u89C4\u5219\u914D\u7F6E\uFF08\u89E6\u53D1 Interstitial\uFF09</div>
      <div class="code-block">
<span class="comment"># \u65B9\u5F0F\u4E00\uFF1A\u5BF9\u7279\u5B9A\u8DEF\u5F84\u542F\u7528 Managed Challenge</span>
<span class="kw">Rule Name:</span> <span class="str">Interstitial - Protected Admin Area</span>
<span class="kw">Expression:</span>
  <span class="val">(http.request.uri.path eq "/resources/interstitial")</span>
<span class="kw">Action:</span> <span class="str">Managed Challenge</span>

<span class="comment"># \u65B9\u5F0F\u4E8C\uFF1A\u5BF9\u9AD8\u5A01\u80C1\u8BC4\u5206\u7684\u8BF7\u6C42\u89E6\u53D1</span>
<span class="kw">Expression:</span>
  <span class="val">(cf.threat_score gt 14)</span>
  <span class="val">and (http.request.uri.path eq "/resources/interstitial")</span>
<span class="kw">Action:</span> <span class="str">Managed Challenge</span>

<span class="comment"># \u65B9\u5F0F\u4E09\uFF1A\u5BF9\u975E\u6307\u5B9A\u56FD\u5BB6\u7684\u8BF7\u6C42\u89E6\u53D1</span>
<span class="kw">Expression:</span>
  <span class="val">(not ip.geoip.country in {"CN" "US" "JP"})</span>
  <span class="val">and (http.request.uri.path eq "/resources/interstitial")</span>
<span class="kw">Action:</span> <span class="str">Interactive Challenge</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">\u4E0E JS Detection \u7684\u5173\u952E\u533A\u522B</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px;">
        <thead>
          <tr style="border-bottom:1px solid #2d3148;">
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;"></th>
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;">JS Detection</th>
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;">Interstitial</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #2d3148;">
            <td style="padding:6px 8px;color:#7c85a2;">\u53EF\u89C1\u6027</td>
            <td style="padding:6px 8px;color:#e2e8f0;">\u7528\u6237\u4E0D\u53EF\u89C1</td>
            <td style="padding:6px 8px;color:#e2e8f0;">\u5168\u5C4F\u62E6\u622A\u9875</td>
          </tr>
          <tr style="border-bottom:1px solid #2d3148;">
            <td style="padding:6px 8px;color:#7c85a2;">\u4EA4\u4E92\u8981\u6C42</td>
            <td style="padding:6px 8px;color:#e2e8f0;">\u65E0\u9700\u4EA4\u4E92</td>
            <td style="padding:6px 8px;color:#e2e8f0;">\u53EF\u80FD\u9700\u8981\u70B9\u51FB</td>
          </tr>
          <tr style="border-bottom:1px solid #2d3148;">
            <td style="padding:6px 8px;color:#7c85a2;">\u9002\u7528\u573A\u666F</td>
            <td style="padding:6px 8px;color:#e2e8f0;">\u9632\u722C\u866B</td>
            <td style="padding:6px 8px;color:#e2e8f0;">\u9AD8\u4EF7\u503C\u9875\u9762\u4FDD\u62A4</td>
          </tr>
          <tr>
            <td style="padding:6px 8px;color:#7c85a2;">\u6267\u884C\u4F4D\u7F6E</td>
            <td style="padding:6px 8px;color:#e2e8f0;">\u5BA2\u6237\u7AEF JS</td>
            <td style="padding:6px 8px;color:#e2e8f0;">CF \u8FB9\u7F18\u8282\u70B9</td>
          </tr>
        </tbody>
      </table>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `;
  return renderLayout("/resources/interstitial", "Interstitial Challenge", content, cfInfo);
}
__name(interstitialPage, "interstitialPage");

// src/pages/turnstile.ts
function turnstilePage(cfInfo, siteKey, verified = false, error = "") {
  const content = `
    <h2>Turnstile CAPTCHA <span class="badge badge-purple" style="vertical-align:middle;font-size:14px;">TURNSTILE</span></h2>
    <p>
      Cloudflare Turnstile \u662F reCAPTCHA \u548C hCaptcha \u7684\u73B0\u4EE3\u66FF\u4EE3\u54C1\uFF0C\u5927\u591A\u6570\u771F\u5B9E\u7528\u6237<strong>\u65E0\u9700\u4EFB\u4F55\u4EA4\u4E92</strong>\u5373\u53EF\u901A\u8FC7\u3002\u5B83\u5728\u540E\u53F0\u5206\u6790\u6D4F\u89C8\u5668\u4FE1\u53F7\uFF0C\u53EA\u6709\u53EF\u7591\u8BBF\u5BA2\u624D\u4F1A\u770B\u5230 CAPTCHA\u3002
    </p>

    ${verified ? `
    <div class="card" style="border-color:rgba(16,185,129,0.4);background:rgba(16,185,129,0.05);">
      <div class="card-title" style="color:#10b981;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Turnstile \u9A8C\u8BC1\u901A\u8FC7\uFF01
      </div>
      <div class="card-desc">
        \u4F60\u7684 Token \u5DF2\u901A\u8FC7\u670D\u52A1\u7AEF\u9A8C\u8BC1\u3002\u5728\u771F\u5B9E\u573A\u666F\u4E2D\uFF0C\u6B64\u65F6\u7528\u6237\u53EF\u4EE5\u63D0\u4EA4\u8868\u5355\u3001\u4E0B\u8F7D\u6587\u4EF6\u6216\u8BBF\u95EE\u53D7\u4FDD\u62A4\u5185\u5BB9\u3002
      </div>
    </div>
    ` : ""}

    ${error ? `
    <div class="card" style="border-color:rgba(239,68,68,0.4);background:rgba(239,68,68,0.05);">
      <div class="card-title" style="color:#ef4444;">\u9A8C\u8BC1\u5931\u8D25</div>
      <div class="card-desc">${error}</div>
    </div>
    ` : ""}

    ${!verified ? `
    <div class="card" style="border-color:rgba(139,92,246,0.3);">
      <div class="card-title" style="color:#8b5cf6;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        \u89E3\u9501\u53D7\u4FDD\u62A4\u5185\u5BB9
      </div>
      <div class="card-desc" style="margin-bottom:16px;">
        \u5B8C\u6210\u4E0B\u65B9 Turnstile \u9A8C\u8BC1\u540E\u5373\u53EF\u8BBF\u95EE\u5185\u5BB9\u3002\u5927\u591A\u6570\u7528\u6237\u4F1A\u7ACB\u5373\u81EA\u52A8\u901A\u8FC7\u3002
      </div>
      <form method="POST" action="/resources/turnstile" id="turnstile-form">
        <div id="turnstile-widget" style="margin-bottom:16px;"></div>
        <button type="submit" id="submit-btn"
          style="padding:10px 20px;background:rgba(139,92,246,0.8);border:none;border-radius:6px;color:#fff;font-size:13px;cursor:pointer;font-weight:500;width:100%;transition:opacity 0.2s;"
          disabled>
          \u9A8C\u8BC1\u5E76\u8BBF\u95EE\u5185\u5BB9
        </button>
      </form>
    </div>
    ` : ""}

    ${verified ? `
    <div class="card" style="border-color:rgba(139,92,246,0.3);">
      <div class="card-title" style="color:#8b5cf6;">\u53D7\u4FDD\u62A4\u5185\u5BB9</div>
      <div class="card-desc">
        \u8FD9\u662F\u53EA\u6709\u901A\u8FC7 Turnstile \u9A8C\u8BC1\u7684\u7528\u6237\u624D\u80FD\u770B\u5230\u7684\u5185\u5BB9\u3002\u5728\u5B9E\u9645\u5E94\u7528\u4E2D\uFF0C\u8FD9\u91CC\u53EF\u4EE5\u662F\uFF1A\u4E0B\u8F7D\u94FE\u63A5\u3001\u4ED8\u8D39\u5185\u5BB9\u3001API \u5BC6\u94A5\u3001\u8868\u5355\u63D0\u4EA4\u786E\u8BA4\u7B49\u3002
      </div>
      <div class="code-block" style="margin-top:12px;">
<span class="comment"># \u4F60\u7684\u4E13\u5C5E\u8BBF\u95EE\u4EE4\u724C\uFF08\u793A\u4F8B\uFF09</span>
TOKEN: <span class="val">ts_verified_${Date.now().toString(36).toUpperCase()}</span>
EXPIRES: <span class="val">${new Date(Date.now() + 36e5).toISOString()}</span>
      </div>
      <a href="/resources/turnstile"
        style="display:inline-block;margin-top:12px;padding:8px 16px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:6px;color:#8b5cf6;font-size:13px;">
        \u91CD\u65B0\u9A8C\u8BC1 \u2192
      </a>
    </div>
    ` : ""}

    <div class="card">
      <div class="card-title" style="font-size:14px;">Turnstile \u5DE5\u4F5C\u6D41\u7A0B</div>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-content"><strong>\u9875\u9762\u52A0\u8F7D Widget</strong>\uFF1A\u5F15\u5165 Turnstile JS SDK\uFF0C\u6E32\u67D3 widget</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-content"><strong>\u540E\u53F0\u5206\u6790</strong>\uFF1ATurnstile \u6536\u96C6\u6D4F\u89C8\u5668\u4FE1\u53F7\uFF0C\u5927\u591A\u6570\u7528\u6237\u81EA\u52A8\u901A\u8FC7</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-content"><strong>\u83B7\u5F97 Token</strong>\uFF1A\u9A8C\u8BC1\u6210\u529F\u540E\uFF0CWidget \u751F\u6210\u4E00\u6B21\u6027 token \u586B\u5165\u8868\u5355</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-content"><strong>\u8868\u5355\u63D0\u4EA4</strong>\uFF1Atoken \u968F\u8868\u5355\u4E00\u8D77\u53D1\u9001\u5230\u670D\u52A1\u7AEF\uFF08Worker\uFF09</div>
      </div>
      <div class="step">
        <div class="step-num">5</div>
        <div class="step-content"><strong>\u670D\u52A1\u7AEF\u9A8C\u8BC1</strong>\uFF1AWorker \u8C03\u7528 CF Turnstile API \u9A8C\u8BC1 token \u771F\u5B9E\u6027</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">Worker \u670D\u52A1\u7AEF\u9A8C\u8BC1\u4EE3\u7801</div>
      <div class="code-block">
<span class="comment">// \u5728 Cloudflare Worker \u4E2D\u9A8C\u8BC1 Turnstile token</span>
<span class="kw">async function</span> <span class="val">verifyTurnstile</span>(token: string, secret: string) {
  <span class="kw">const</span> resp = <span class="kw">await</span> fetch(
    <span class="str">'https://challenges.cloudflare.com/turnstile/v0/siteverify'</span>,
    {
      method: <span class="str">'POST'</span>,
      body: <span class="val">JSON.stringify</span>({ secret, response: token }),
      headers: { <span class="str">'Content-Type'</span>: <span class="str">'application/json'</span> },
    }
  );
  <span class="kw">const</span> data = <span class="kw">await</span> resp.<span class="val">json</span>();
  <span class="kw">return</span> data.success; <span class="comment">// true = \u9A8C\u8BC1\u901A\u8FC7</span>
}
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">\u4E0E\u4F20\u7EDF CAPTCHA \u5BF9\u6BD4</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px;">
        <thead>
          <tr style="border-bottom:1px solid #2d3148;">
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;"></th>
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;">reCAPTCHA v2</th>
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;">Turnstile</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #2d3148;">
            <td style="padding:6px 8px;color:#7c85a2;">\u7528\u6237\u4EA4\u4E92</td>
            <td style="padding:6px 8px;color:#e2e8f0;">\u70B9\u51FB checkbox / \u56FE\u7247</td>
            <td style="padding:6px 8px;color:#10b981;">\u901A\u5E38\u65E0\u9700\u4EA4\u4E92</td>
          </tr>
          <tr style="border-bottom:1px solid #2d3148;">
            <td style="padding:6px 8px;color:#7c85a2;">\u9690\u79C1</td>
            <td style="padding:6px 8px;color:#ef4444;">Google \u8FFD\u8E2A</td>
            <td style="padding:6px 8px;color:#10b981;">\u65E0\u7B2C\u4E09\u65B9\u8FFD\u8E2A</td>
          </tr>
          <tr>
            <td style="padding:6px 8px;color:#7c85a2;">\u514D\u8D39\u989D\u5EA6</td>
            <td style="padding:6px 8px;color:#e2e8f0;">\u6709\u9650\u5236</td>
            <td style="padding:6px 8px;color:#10b981;">100\u4E07\u6B21/\u6708\u514D\u8D39</td>
          </tr>
        </tbody>
      </table>
    </div>

    ${!verified ? `
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer><\/script>
    <script>
      window.onTurnstileLoad = function() {
        turnstile.render('#turnstile-widget', {
          sitekey: '${siteKey}',
          theme: 'dark',
          callback: function(token) {
            document.getElementById('submit-btn').disabled = false;
            document.getElementById('submit-btn').style.opacity = '1';
          },
          'expired-callback': function() {
            document.getElementById('submit-btn').disabled = true;
            document.getElementById('submit-btn').style.opacity = '0.5';
          }
        });
      };
    <\/script>
    ` : ""}
  `;
  const extraHead = !verified ? `<script>
    // Turnstile callback hook
    window.turnstileCallbacks = [];
    <\/script>` : "";
  return renderLayout("/resources/turnstile", "Turnstile", content, cfInfo, extraHead);
}
__name(turnstilePage, "turnstilePage");

// src/api/fingerprint.ts
function fingerprintApi(request) {
  const cfInfo = parseCFHeaders(request);
  return new Response(JSON.stringify(cfInfo), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(fingerprintApi, "fingerprintApi");

// src/api/verify.ts
async function verifyTurnstile(token, secret) {
  if (!token) {
    return { success: false, error: "\u672A\u63D0\u4F9B Turnstile token" };
  }
  try {
    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: JSON.stringify({ secret, response: token }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await resp.json();
    if (data.success) {
      return { success: true };
    }
    const codes = data["error-codes"] ?? [];
    return { success: false, error: `\u9A8C\u8BC1\u5931\u8D25: ${codes.join(", ") || "\u672A\u77E5\u9519\u8BEF"}` };
  } catch (e) {
    return { success: false, error: "\u65E0\u6CD5\u8FDE\u63A5\u9A8C\u8BC1\u670D\u52A1\u5668" };
  }
}
__name(verifyTurnstile, "verifyTurnstile");

// src/static/fingerprint.ts
var FINGERPRINT_JS = `
(function() {
  'use strict';

  // ---- Utility ----
  function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }

  function truncate(str, n) {
    return str && str.length > n ? str.slice(0, n) + '...' : (str || '\u2014');
  }

  // ---- Canvas Fingerprint ----
  function canvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f6821f';
      ctx.fillRect(0, 0, 240, 60);
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.fillText('CF Challenge Demo \u{1F525}', 10, 35);
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(200, 30, 20, 0, Math.PI * 2);
      ctx.stroke();
      return hash(canvas.toDataURL()).toUpperCase();
    } catch (e) {
      return 'BLOCKED';
    }
  }

  // ---- WebGL Fingerprint ----
  function webglFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { renderer: 'NO_WEBGL', vendor: '\u2014', hash: '\u2014' };
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      const vendor = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
      return {
        renderer: truncate(renderer, 40),
        vendor: truncate(vendor, 30),
        hash: hash(renderer + vendor).toUpperCase(),
      };
    } catch (e) {
      return { renderer: 'ERROR', vendor: '\u2014', hash: '\u2014' };
    }
  }

  // ---- Audio Fingerprint ----
  function audioFingerprint(cb) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
      const oscillator = ctx.createOscillator();
      const analyser = ctx.createAnalyser();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      oscillator.type = 'triangle';
      oscillator.frequency.value = 10000;
      oscillator.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(0);
      const buf = new Float32Array(analyser.frequencyBinCount);
      setTimeout(function() {
        analyser.getFloatFrequencyData(buf);
        oscillator.stop();
        ctx.close();
        const fp = hash(buf.slice(0, 30).join(','));
        cb(fp.toUpperCase());
      }, 100);
    } catch (e) {
      cb('BLOCKED');
    }
  }

  // ---- Font Detection ----
  function detectFonts() {
    const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS',
      'Arial Black', 'Impact', 'Lucida Console', 'Tahoma'];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const baseFont = 'monospace';
    ctx.font = '72px ' + baseFont;
    const baseWidth = ctx.measureText('mmmmmmmmmmlli').width;
    const detected = fonts.filter(function(font) {
      ctx.font = '72px ' + font + ', ' + baseFont;
      return ctx.measureText('mmmmmmmmmmlli').width !== baseWidth;
    });
    return detected.length + '/' + fonts.length;
  }

  // ---- Headless / Bot Detection ----
  function detectHeadless() {
    const signals = [];

    // WebDriver
    if (navigator.webdriver) signals.push('webdriver=true');

    // Missing plugins
    if (navigator.plugins.length === 0) signals.push('no-plugins');

    // Languages check
    if (!navigator.languages || navigator.languages.length === 0) signals.push('no-languages');

    // Notification permission automation
    try {
      if (window.Notification && Notification.permission === 'default') {
        // Normal
      }
    } catch (e) {
      signals.push('notification-err');
    }

    // Chrome object check
    if (typeof window.chrome === 'undefined' && /Chrome/.test(navigator.userAgent)) {
      signals.push('no-chrome-obj');
    }

    // Permissions inconsistency
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'notifications' }).then(function(perm) {
        if (perm.state === 'denied' && Notification.permission !== 'denied') {
          addBotSignal('perm-inconsist');
        }
      }).catch(function() {});
    }

    // Phantom/Selenium artifacts
    if (window._phantom || window.__nightmare || window.callPhantom) signals.push('phantom');
    if (document.__selenium_unwrapped || document.__webdriver_evaluate) signals.push('selenium');

    return signals;
  }

  // ---- WebRTC Local IP ----
  function getWebRTCIP(cb) {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer().then(function(offer) { return pc.setLocalDescription(offer); });
      pc.onicecandidate = function(e) {
        if (!e || !e.candidate) return;
        const match = /([0-9]{1,3}(.[0-9]{1,3}){3})/.exec(e.candidate.candidate);
        if (match) {
          pc.close();
          cb(match[1]);
        }
      };
      setTimeout(function() { cb('\u2014'); }, 1000);
    } catch (e) {
      cb('BLOCKED');
    }
  }

  // ---- Render to DOM ----
  function fpRow(key, val, cls) {
    return '<div class="fp-row"><span class="fp-key">' + key + '</span><span class="fp-val' + (cls ? ' ' + cls : '') + '">' + val + '</span></div>';
  }

  var botSignalsList = [];
  function addBotSignal(s) {
    botSignalsList.push(s);
    renderBotSignals();
  }

  function renderBotSignals() {
    var el = document.getElementById('bot-signals');
    if (!el) return;
    var isBot = botSignalsList.length > 0;
    var verdict = isBot
      ? '<div class="fp-row"><span class="fp-key">\u5224\u5B9A</span><span class="fp-val bad">\u53EF\u7591 Bot \u26A0</span></div>'
      : '<div class="fp-row"><span class="fp-key">\u5224\u5B9A</span><span class="fp-val good">\u6B63\u5E38\u6D4F\u89C8\u5668 \u2713</span></div>';
    var signals = botSignalsList.map(function(s) {
      return fpRow(s, '\u68C0\u6D4B\u5230', 'bad');
    }).join('');
    el.innerHTML = verdict + signals;
  }

  function collectAndRender() {
    var canvas = canvasFingerprint();
    var webgl = webglFingerprint();
    var botSignals = detectHeadless();
    botSignalsList = botSignals;

    var ua = navigator.userAgent;
    var platform = navigator.platform || '\u2014';
    var lang = navigator.language || '\u2014';
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '\u2014';
    var screen_res = window.screen.width + 'x' + window.screen.height;
    var color_depth = window.screen.colorDepth + 'bit';
    var pixel_ratio = window.devicePixelRatio || 1;
    var cpu_cores = navigator.hardwareConcurrency || '\u2014';
    var mem = navigator.deviceMemory ? navigator.deviceMemory + 'GB' : '\u2014';
    var touch = navigator.maxTouchPoints > 0 ? 'Yes (' + navigator.maxTouchPoints + ')' : 'No';
    var cookies = navigator.cookieEnabled ? 'Yes' : 'No';
    var dnt = navigator.doNotTrack === '1' ? 'On' : 'Off';
    var plugins = navigator.plugins.length;
    var fonts = detectFonts();

    var rows = [
      fpRow('Canvas', canvas, 'warn'),
      fpRow('WebGL Hash', webgl.hash, 'warn'),
      fpRow('GPU', webgl.renderer),
      fpRow('\u5C4F\u5E55', screen_res),
      fpRow('\u8272\u6DF1', color_depth),
      fpRow('DPR', pixel_ratio + 'x'),
      fpRow('\u8BED\u8A00', lang),
      fpRow('\u65F6\u533A', truncate(tz, 20)),
      fpRow('\u5E73\u53F0', platform),
      fpRow('CPU', cpu_cores + ' cores'),
      fpRow('\u5185\u5B58', mem),
      fpRow('\u89E6\u63A7', touch),
      fpRow('\u63D2\u4EF6\u6570', plugins),
      fpRow('\u5B57\u4F53', fonts),
      fpRow('Cookie', cookies),
      fpRow('DNT', dnt),
      fpRow('WebDriver', navigator.webdriver ? '<span class="bad">true \u26A0</span>' : 'false'),
    ].join('');

    var el = document.getElementById('client-fp');
    if (el) el.innerHTML = rows;

    renderBotSignals();

    // Audio fingerprint (async)
    audioFingerprint(function(fp) {
      var el2 = document.getElementById('client-fp');
      if (el2) {
        var audioRow = fpRow('Audio Hash', fp, 'warn');
        el2.innerHTML += audioRow;
      }
    });

    // WebRTC IP (async)
    getWebRTCIP(function(ip) {
      var el3 = document.getElementById('client-fp');
      if (el3) {
        el3.innerHTML += fpRow('WebRTC IP', ip, ip !== '\u2014' && ip !== 'BLOCKED' ? 'warn' : '');
      }
    });

    // Check bot signals after async checks
    if (botSignals.length > 0) {
      botSignals.forEach(function(s) { addBotSignal(s); });
    } else {
      renderBotSignals();
    }
  }

  // Run after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', collectAndRender);
  } else {
    collectAndRender();
  }
})();
`;

// src/index.ts
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/static/fingerprint.js") {
      return new Response(FINGERPRINT_JS, {
        headers: { "Content-Type": "application/javascript; charset=utf-8" }
      });
    }
    if (path === "/api/fingerprint") {
      return fingerprintApi(request);
    }
    const cfInfo = parseCFHeaders(request);
    const html = /* @__PURE__ */ __name((body) => new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } }), "html");
    if (path === "/" || path === "") {
      return html(homePage(cfInfo));
    }
    if (path === "/resources/public") {
      return html(publicPage(cfInfo));
    }
    if (path === "/resources/js-protected") {
      return html(jsProtectedPage(cfInfo));
    }
    if (path === "/resources/interstitial") {
      return html(interstitialPage(cfInfo));
    }
    if (path === "/resources/turnstile") {
      const siteKey = env.TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";
      const secretKey = env.TURNSTILE_SECRET_KEY ?? "1x0000000000000000000000000000000AA";
      if (request.method === "POST") {
        const formData = await request.formData();
        const token = formData.get("cf-turnstile-response");
        const result = await verifyTurnstile(token, secretKey);
        if (result.success) {
          return html(turnstilePage(cfInfo, siteKey, true));
        } else {
          return html(turnstilePage(cfInfo, siteKey, false, result.error));
        }
      }
      return html(turnstilePage(cfInfo, siteKey));
    }
    return new Response("Not Found", { status: 404 });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-Tgabqe/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-Tgabqe/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
