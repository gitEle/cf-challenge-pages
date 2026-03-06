import { renderLayout } from '../layout';
import type { CFInfo } from '../utils/cf-headers';

export function homePage(cfInfo: CFInfo): string {
  const content = `
    <h2>Cloudflare Challenge Types 演示</h2>
    <p>本站演示 Cloudflare 提供的三种主要访客验证机制（Challenge），帮助你理解它们的工作原理、触发条件和配置方式。</p>

    <div class="card" style="border-color: rgba(246,130,31,0.4); background: rgba(246,130,31,0.05);">
      <div class="card-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#f6821f"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        关于右侧指纹面板
      </div>
      <div class="card-desc">
        右侧实时显示两类数据：<br>
        <strong style="color:#e2e8f0">Cloudflare 服务端</strong> — Worker 从请求头读取的 CF 数据，包括你的 IP、Ray ID、威胁评分等，这是 CF 判断是否触发 Challenge 的依据。<br><br>
        <strong style="color:#e2e8f0">客户端指纹</strong> — 浏览器 JS 收集的信号，Canvas Hash、WebGL、硬件信息等，这正是 <em>JS Detection</em> Challenge 所检测的内容。
      </div>
    </div>

    <div class="card">
      <div class="card-title">
        <span class="badge badge-green">1</span>
        Interstitial Challenge Page
      </div>
      <div class="card-desc">
        Cloudflare 在请求到达源站之前插入一个全屏拦截页，要求访客证明自己是人类。典型场景是 WAF 规则触发 <code>Managed Challenge</code> 或 <code>JS Challenge</code>。
      </div>
      <a href="/resources/interstitial" style="display:inline-block;margin-top:12px;padding:8px 16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;color:#ef4444;font-size:13px;">
        前往演示 →
      </a>
    </div>

    <div class="card">
      <div class="card-title">
        <span class="badge badge-yellow">2</span>
        JavaScript Detection
      </div>
      <div class="card-desc">
        Cloudflare 下发一段 JS Challenge，浏览器必须执行完成后才能访问内容。无法运行 JS 的爬虫、curl 等工具会被阻止。右侧面板展示了 CF 会收集哪些 JS 信号。
      </div>
      <a href="/resources/js-protected" style="display:inline-block;margin-top:12px;padding:8px 16px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:6px;color:#f59e0b;font-size:13px;">
        前往演示 →
      </a>
    </div>

    <div class="card">
      <div class="card-title">
        <span class="badge badge-purple">3</span>
        Turnstile CAPTCHA
      </div>
      <div class="card-desc">
        Cloudflare Turnstile 是新一代 CAPTCHA 替代方案，大多数真实用户无需与 widget 交互即可通过验证。后端通过验证 token 来确认访客合法性。
      </div>
      <a href="/resources/turnstile" style="display:inline-block;margin-top:12px;padding:8px 16px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:6px;color:#8b5cf6;font-size:13px;">
        前往演示 →
      </a>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;color:#7c85a2;">Challenge 对比</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px;">
        <thead>
          <tr style="border-bottom:1px solid #2d3148;">
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;">类型</th>
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;">用户体验</th>
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;">触发方式</th>
            <th style="text-align:left;padding:6px 8px;color:#7c85a2;font-weight:500;">适用场景</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #2d3148;">
            <td style="padding:6px 8px;"><span class="badge badge-red">Interstitial</span></td>
            <td style="padding:6px 8px;color:#7c85a2;">全屏拦截页</td>
            <td style="padding:6px 8px;color:#7c85a2;">WAF 规则</td>
            <td style="padding:6px 8px;color:#7c85a2;">高风险路由保护</td>
          </tr>
          <tr style="border-bottom:1px solid #2d3148;">
            <td style="padding:6px 8px;"><span class="badge badge-yellow">JS Detection</span></td>
            <td style="padding:6px 8px;color:#7c85a2;">自动通过</td>
            <td style="padding:6px 8px;color:#7c85a2;">WAF / Bot Management</td>
            <td style="padding:6px 8px;color:#7c85a2;">防爬虫</td>
          </tr>
          <tr>
            <td style="padding:6px 8px;"><span class="badge badge-purple">Turnstile</span></td>
            <td style="padding:6px 8px;color:#7c85a2;">Widget 嵌入</td>
            <td style="padding:6px 8px;color:#7c85a2;">开发者集成</td>
            <td style="padding:6px 8px;color:#7c85a2;">表单/内容保护</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  return renderLayout('/', 'Home', content, cfInfo);
}
