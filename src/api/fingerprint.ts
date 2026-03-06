import { parseCFHeaders } from '../utils/cf-headers';

export function fingerprintApi(request: Request): Response {
  const cfInfo = parseCFHeaders(request);
  return new Response(JSON.stringify(cfInfo), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
