import { renderLayout } from '../layout';
import type { CFInfo } from '../utils/cf-headers';

export function jsProtectedPage(cfInfo: CFInfo): string {
  const content = `
    <h2>JavaScript Detection <span class="badge badge-yellow" style="vertical-align:middle;font-size:14px;">JS Challenge</span></h2>
    <p>
      此页面模拟 Cloudflare <strong>JS Challenge</strong> 保护场景。在真实部署中，Cloudflare 边缘节点会在返回此内容之前，先向浏览器下发一个 JavaScript 计算挑战。
    </p>

    <div class="card" style="border-color:rgba(245,158,11,0.3);">
      <div class="card-title" style="color:#f59e0b;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        你正在浏览受保护内容
      </div>
      <div class="card-desc">
        在生产环境中，如果你使用 <code>curl</code>、无头浏览器或禁用 JS 的客户端访问，将会看到 Cloudflare 的 JS Challenge 页面而不是这里的内容。
        <br><br>
        右侧 <strong>"Bot 检测信号"</strong> 面板展示了 Cloudflare 实际检测的客户端特征。
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">JS Detection 工作原理</div>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-content"><strong>CF 下发挑战页</strong>：返回一个包含 JS 计算任务的 HTML，而非目标内容</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-content"><strong>浏览器执行 JS</strong>：完成 CPU 密集型计算（如 Proof of Work）</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-content"><strong>收集环境信号</strong>：Canvas、WebGL、时区、插件、字体等（见右侧面板）</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-content"><strong>提交结果</strong>：浏览器携带计算结果重新请求，CF 验证通过后设置 Cookie</div>
      </div>
      <div class="step">
        <div class="step-num">5</div>
        <div class="step-content"><strong>访问放行</strong>：后续请求携带 CF 验证 Cookie，无需重复验证</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">WAF 规则配置</div>
      <div class="code-block">
<span class="comment"># Cloudflare Dashboard → Security → WAF → Custom Rules</span>

<span class="kw">Rule Name:</span> <span class="str">JS Challenge - Protected Resources</span>
<span class="kw">Expression:</span>
  <span class="val">(http.request.uri.path eq "/resources/js-protected")</span>
<span class="kw">Action:</span> <span class="str">JS Challenge</span>

<span class="comment"># 或者使用 Bot Management 的自动模式:</span>
<span class="kw">Expression:</span>
  <span class="val">(cf.bot_management.score lt 30)</span>
  <span class="val">and (http.request.uri.path eq "/resources/js-protected")</span>
<span class="kw">Action:</span> <span class="str">JS Challenge</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">用 curl 测试（会被拦截）</div>
      <div class="code-block">
<span class="comment"># 使用 curl 访问此页面，在真实部署中将返回 CF JS Challenge 页</span>
$ <span class="val">curl -s https://your-worker.workers.dev/resources/js-protected</span>

<span class="comment"># 响应会是一个 HTML challenge 页，而不是内容</span>
<span class="comment"># HTTP 状态码: 403 或 503</span>
      </div>
    </div>
  `;

  return renderLayout('/resources/js-protected', 'JS Detection', content, cfInfo);
}
