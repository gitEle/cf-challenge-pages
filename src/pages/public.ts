import { renderLayout } from '../layout';
import type { CFInfo } from '../utils/cf-headers';

export function publicPage(cfInfo: CFInfo): string {
  const content = `
    <h2>Public Resource <span class="badge badge-green" style="vertical-align:middle;font-size:14px;">无保护</span></h2>
    <p>此页面没有任何 Challenge 保护，所有访客均可直接访问。这是对比基准页面。</p>

    <div class="card" style="border-color:rgba(16,185,129,0.3);">
      <div class="card-title" style="color:#10b981;">公开文档资源</div>
      <div class="card-desc">
        你已成功访问此公开资源。注意右侧面板——即使没有任何 Challenge，Cloudflare 依然会记录你的指纹信息并持续分析威胁评分。
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">WAF 规则配置（无保护）</div>
      <div class="code-block">
<span class="comment"># 此路由不需要任何 WAF 规则</span>
<span class="comment"># Cloudflare Dashboard → Security → WAF → Custom Rules</span>

<span class="kw">Rule:</span> <span class="str">Allow /resources/public</span>
<span class="kw">Expression:</span> <span class="val">(http.request.uri.path eq "/resources/public")</span>
<span class="kw">Action:</span> <span class="str">Allow</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="font-size:14px;">此页面工作原理</div>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-content"><strong>浏览器发起请求</strong> → Cloudflare 边缘节点接收</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-content"><strong>CF 检查威胁评分</strong>：低于阈值则直接放行</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-content"><strong>请求转发</strong> 到 Worker，返回页面内容</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-content"><strong>右侧指纹面板</strong>展示 CF 在此过程中收集的所有信息</div>
      </div>
    </div>

    <p style="color:#7c85a2;font-size:12px;">
      对比：<a href="/resources/js-protected">访问受 JS Detection 保护的页面</a> 查看差异。
    </p>
  `;

  return renderLayout('/resources/public', 'Public Resource', content, cfInfo);
}
