import { renderLayout } from '../layout';
import type { CFInfo } from '../utils/cf-headers';

export function turnstilePage(cfInfo: CFInfo, siteKey: string, verified = false, error = ''): string {
  const content = `
    <h2>Turnstile CAPTCHA <span class="badge badge-purple" style="vertical-align:middle;font-size:14px;">TURNSTILE</span></h2>
    <p>
      Cloudflare Turnstile 是 reCAPTCHA 和 hCaptcha 的现代替代品，大多数真实用户<strong>无需任何交互</strong>即可通过。它在后台分析浏览器信号，只有可疑访客才会看到 CAPTCHA。
    </p>

    ${verified ? `
    <div class="card" style="border-color:rgba(16,185,129,0.4);background:rgba(16,185,129,0.05);">
      <div class="card-title" style="color:#10b981;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Turnstile 验证通过！
      </div>
      <div class="card-desc">
        你的 Token 已通过服务端验证。在真实场景中，此时用户可以提交表单、下载文件或访问受保护内容。
      </div>
    </div>
    ` : ''}

    ${error ? `
    <div class="card" style="border-color:rgba(239,68,68,0.4);background:rgba(239,68,68,0.05);">
      <div class="card-title" style="color:#ef4444;">验证失败</div>
      <div class="card-desc">${error}</div>
    </div>
    ` : ''}

    ${!verified ? `
    <div class="card" style="border-color:rgba(139,92,246,0.3);">
      <div class="card-title" style="color:#8b5cf6;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        解锁受保护内容
      </div>
      <div class="card-desc" style="margin-bottom:16px;">
        完成下方 Turnstile 验证后即可访问内容。大多数用户会立即自动通过。
      </div>
      <form method="POST" action="/resources/turnstile" id="turnstile-form">
        <div id="turnstile-widget" style="margin-bottom:16px;min-height:65px;">
          <div style="color:#7c85a2;font-size:12px;padding:20px 0;">Turnstile 加载中...</div>
        </div>
        <button type="submit" id="submit-btn"
          style="padding:10px 20px;background:rgba(139,92,246,0.8);border:none;border-radius:6px;color:#fff;font-size:13px;cursor:pointer;font-weight:500;width:100%;transition:opacity 0.2s;"
          disabled>
          验证并访问内容
        </button>
      </form>
    </div>
    ` : ''}

    ${verified ? `
    <div class="card" style="border-color:rgba(139,92,246,0.3);">
      <div class="card-title" style="color:#8b5cf6;">受保护内容</div>
      <div class="card-desc">
        这是只有通过 Turnstile 验证的用户才能看到的内容。在实际应用中，这里可以是：下载链接、付费内容、API 密钥、表单提交确认等。
      </div>
      <div class="code-block" style="margin-top:12px;">
<span class="comment"># 你的专属访问令牌（示例）</span>
TOKEN: <span class="val">ts_verified_${Date.now().toString(36).toUpperCase()}</span>
EXPIRES: <span class="val">${new Date(Date.now() + 3600000).toISOString()}</span>
      </div>
      <a href="/resources/turnstile"
        style="display:inline-block;margin-top:12px;padding:8px 16px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:6px;color:#8b5cf6;font-size:13px;">
        重新验证 →
      </a>
    </div>
    ` : ''}

    <div class="card">
      <div class="card-title" style="font-size:14px;">Turnstile 工作流程</div>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-content"><strong>页面加载 Widget</strong>：引入 Turnstile JS SDK，渲染 widget</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-content"><strong>后台分析</strong>：Turnstile 收集浏览器信号，大多数用户自动通过</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-content"><strong>获得 Token</strong>：验证成功后，Widget 生成一次性 token 填入表单</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-content"><strong>表单提交</strong>：token 随表单一起发送到服务端（Worker）</div>
      </div>
      <div class="step">
        <div class="step-num">5</div>
        <div class="step-content"><strong>服务端验证</strong>：Worker 调用 CF Turnstile API 验证 token 真实性</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">Worker 服务端验证代码</div>
      <div class="code-block">
<span class="comment">// 在 Cloudflare Worker 中验证 Turnstile token</span>
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
  <span class="kw">return</span> data.success; <span class="comment">// true = 验证通过</span>
}
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">与传统 CAPTCHA 对比</div>
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
            <td style="padding:6px 8px;color:#7c85a2;">用户交互</td>
            <td style="padding:6px 8px;color:#e2e8f0;">点击 checkbox / 图片</td>
            <td style="padding:6px 8px;color:#10b981;">通常无需交互</td>
          </tr>
          <tr style="border-bottom:1px solid #2d3148;">
            <td style="padding:6px 8px;color:#7c85a2;">隐私</td>
            <td style="padding:6px 8px;color:#ef4444;">Google 追踪</td>
            <td style="padding:6px 8px;color:#10b981;">无第三方追踪</td>
          </tr>
          <tr>
            <td style="padding:6px 8px;color:#7c85a2;">免费额度</td>
            <td style="padding:6px 8px;color:#e2e8f0;">有限制</td>
            <td style="padding:6px 8px;color:#10b981;">100万次/月免费</td>
          </tr>
        </tbody>
      </table>
    </div>

    ${!verified ? `
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit" async defer></script>
    <script>
      var submitBtn = null;

      window.onTurnstileLoad = function() {
        submitBtn = document.getElementById('submit-btn');
        var widget = document.getElementById('turnstile-widget');
        if (widget) {
          widget.innerHTML = '';
        }
        turnstile.render('#turnstile-widget', {
          sitekey: '${siteKey}',
          theme: 'dark',
          callback: function(token) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.textContent = '验证并访问内容';
          },
          'before-interactive-callback': function() {
            submitBtn.textContent = '请完成上方验证...';
          },
          'expired-callback': function() {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.textContent = '验证已过期，请重试';
          },
          'error-callback': function() {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.textContent = '验证出错，请刷新页面';
          }
        });
      };

      document.getElementById('turnstile-form').addEventListener('submit', function() {
        var btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;justify-content:center;">'
          + '<svg style="animation:spin 1s linear infinite" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>'
          + '服务端验证中...</span>';
      });
    </script>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    ` : ''}
  `;

  const extraHead = !verified
    ? `<script>
    // Turnstile callback hook
    window.turnstileCallbacks = [];
    </script>`
    : '';

  return renderLayout('/resources/turnstile', 'Turnstile', content, cfInfo, extraHead);
}
