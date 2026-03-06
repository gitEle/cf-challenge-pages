export interface CFInfo {
  ip: string;
  country: string;
  city: string;
  region: string;
  continent: string;
  asn: string;
  isp: string;
  rayId: string;
  deviceType: string;
  tlsVersion: string;
  httpProtocol: string;
  threatScore: string;
  botScore: string;
  latitude: string;
  longitude: string;
  postalCode: string;
  timezone: string;
}

export function parseCFHeaders(request: Request): CFInfo {
  const h = (name: string) => request.headers.get(name) ?? '—';
  const visitor = h('CF-Visitor');
  let tlsVersion = '—';
  try {
    const parsed = JSON.parse(visitor);
    tlsVersion = parsed.scheme === 'https' ? 'HTTPS' : 'HTTP';
  } catch {}

  return {
    ip: h('CF-Connecting-IP'),
    country: h('CF-IPCountry'),
    city: h('CF-IPCity'),
    region: h('CF-IPRegion'),
    continent: h('CF-IPContinent'),
    asn: h('CF-ASN'),
    isp: h('CF-ISP'),
    rayId: h('CF-Ray'),
    deviceType: h('CF-Device-Type'),
    tlsVersion,
    httpProtocol: (request as any).cf?.httpProtocol ?? h('CF-Version-Beta') ?? '—',
    threatScore: (request as any).cf?.threatScore?.toString() ?? '—',
    botScore: (request as any).cf?.botManagement?.score?.toString() ?? '—',
    latitude: (request as any).cf?.latitude ?? '—',
    longitude: (request as any).cf?.longitude ?? '—',
    postalCode: (request as any).cf?.postalCode ?? '—',
    timezone: (request as any).cf?.timezone ?? '—',
  };
}
