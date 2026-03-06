import { renderLayout } from '../layout';
import type { CFInfo } from '../utils/cf-headers';

export function interstitialPage(cfInfo: CFInfo): string {
  const content = `
    <h2>Interstitial Challenge Page <span class="badge badge-red" style="vertical-align:middle;font-size:14px;">MANAGED CHALLENGE</span></h2>
    <p>
      Interstitial Challenge 是 Cloudflare 最强的前置验证机制——在请求到达源站之前，会显示一个<strong>全屏拦截页面</strong>，要求访客完成验证。
    </p>

    <div class="card" style="border-color:rgba(239,68,68,0.3);">
      <div class="card-title" style="color:#ef4444;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        你已通过 Interstitial Challenge
      </div>
      <div class="card-desc">
        在生产环境中，访问此页面的用户首先会看到 Cloudflare 的全屏验证页，完成后才能看到此内容。你现在看到这里，说明你的浏览器已通过了验证（或本地开发模式下跳过了验证）。
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">三种 Interstitial Challenge 类型</div>

      <h3 style="color:#f59e0b;">1. JS Challenge（最轻量）</h3>
      <p>浏览器在后台完成 JavaScript 计算，通常用户几乎感知不到。适用于轻度保护。</p>

      <h3 style="color:#ef4444;">2. Managed Challenge（推荐）</h3>
      <p>Cloudflare 自动判断风险等级：低风险用户自动通过，高风险用户显示 CAPTCHA。这是 CF 官方推荐的最佳实践。</p>

      <h3 style="color:#8b5cf6;">3. Interactive Challenge（最严格）</h3>
      <p>强制显示可交互的 CAPTCHA，所有用户都需要手动完成。适用于最高安全要求场景。</p>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">Interstitial 页面长什么样</div>
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
      <div class="card-title" style="font-size:14px;">WAF 规则配置（触发 Interstitial）</div>
      <div class="code-block">
<span class="comment"># 方式一：对特定路径启用 Managed Challenge</span>
<span class="kw">Rule Name:</span> <span class="str">Interstitial - Protected Admin Area</span>
<span class="kw">Expression:</span>
  <span class="val">(http.request.uri.path eq "/resources/interstitial")</span>
<span class="kw">Action:</span> <span class="str">Managed Challenge</span>

<span class="comment"># 方式二：对高威胁评分的请求触发</span>
<span class="kw">Expression:</span>
  <span class="val">(cf.threat_score gt 14)</span>
  <span class="val">and (http.request.uri.path eq "/resources/interstitial")</span>
<span class="kw">Action:</span> <span class="str">Managed Challenge</span>

<span class="comment"># 方式三：对非指定国家的请求触发</span>
<span class="kw">Expression:</span>
  <span class="val">(not ip.geoip.country in {"CN" "US" "JP"})</span>
  <span class="val">and (http.request.uri.path eq "/resources/interstitial")</span>
<span class="kw">Action:</span> <span class="str">Interactive Challenge</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">与 JS Detection 的关键区别</div>
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
            <td style="padding:6px 8px;color:#7c85a2;">可见性</td>
            <td style="padding:6px 8px;color:#e2e8f0;">用户不可见</td>
            <td style="padding:6px 8px;color:#e2e8f0;">全屏拦截页</td>
          </tr>
          <tr style="border-bottom:1px solid #2d3148;">
            <td style="padding:6px 8px;color:#7c85a2;">交互要求</td>
            <td style="padding:6px 8px;color:#e2e8f0;">无需交互</td>
            <td style="padding:6px 8px;color:#e2e8f0;">可能需要点击</td>
          </tr>
          <tr style="border-bottom:1px solid #2d3148;">
            <td style="padding:6px 8px;color:#7c85a2;">适用场景</td>
            <td style="padding:6px 8px;color:#e2e8f0;">防爬虫</td>
            <td style="padding:6px 8px;color:#e2e8f0;">高价值页面保护</td>
          </tr>
          <tr>
            <td style="padding:6px 8px;color:#7c85a2;">执行位置</td>
            <td style="padding:6px 8px;color:#e2e8f0;">客户端 JS</td>
            <td style="padding:6px 8px;color:#e2e8f0;">CF 边缘节点</td>
          </tr>
        </tbody>
      </table>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `;

  return renderLayout('/resources/interstitial', 'Interstitial Challenge', content, cfInfo);
}
