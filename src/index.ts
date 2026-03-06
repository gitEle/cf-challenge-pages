import { parseCFHeaders } from './utils/cf-headers';
import { homePage } from './pages/home';
import { publicPage } from './pages/public';
import { jsProtectedPage } from './pages/js-protected';
import { interstitialPage } from './pages/interstitial';
import { turnstilePage } from './pages/turnstile';
import { fingerprintApi } from './api/fingerprint';
import { verifyTurnstile } from './api/verify';
import { FINGERPRINT_JS } from './static/fingerprint';

interface Env {
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Static assets
    if (path === '/static/fingerprint.js') {
      return new Response(FINGERPRINT_JS, {
        headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
      });
    }

    // API routes
    if (path === '/api/fingerprint') {
      return fingerprintApi(request);
    }

    // HTML pages
    const cfInfo = parseCFHeaders(request);
    const html = (body: string) =>
      new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

    if (path === '/' || path === '') {
      return html(homePage(cfInfo));
    }

    if (path === '/resources/public') {
      return html(publicPage(cfInfo));
    }

    if (path === '/resources/js-protected') {
      return html(jsProtectedPage(cfInfo));
    }

    if (path === '/resources/interstitial') {
      return html(interstitialPage(cfInfo));
    }

    if (path === '/resources/turnstile') {
      const siteKey = env.TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA';
      const secretKey = env.TURNSTILE_SECRET_KEY ?? '1x0000000000000000000000000000000AA';

      if (request.method === 'POST') {
        const formData = await request.formData();
        const token = formData.get('cf-turnstile-response') as string;
        const result = await verifyTurnstile(token, secretKey);

        if (result.success) {
          return html(turnstilePage(cfInfo, siteKey, true));
        } else {
          return html(turnstilePage(cfInfo, siteKey, false, result.error));
        }
      }

      return html(turnstilePage(cfInfo, siteKey));
    }

    return new Response('Not Found', { status: 404 });
  },
};
