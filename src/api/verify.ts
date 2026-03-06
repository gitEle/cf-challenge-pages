export async function verifyTurnstile(token: string, secret: string): Promise<{ success: boolean; error?: string }> {
  if (!token) {
    return { success: false, error: '未提供 Turnstile token' };
  }

  try {
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: JSON.stringify({ secret, response: token }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await resp.json() as { success: boolean; 'error-codes'?: string[] };
    if (data.success) {
      return { success: true };
    }
    const codes = data['error-codes'] ?? [];
    return { success: false, error: `验证失败: ${codes.join(', ') || '未知错误'}` };
  } catch (e) {
    return { success: false, error: '无法连接验证服务器' };
  }
}
