import { HttpResponse, http, type JsonBodyType } from 'msw';
import { api } from './handlers';
import { server } from './server';

/** Serves `body` for `path` and records every request URL it receives. */
export function respondJson(
  path: string,
  body: JsonBodyType,
  status = 200,
): URL[] {
  const requests: URL[] = [];
  server.use(
    http.get(api(path), ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json(body, { status });
    }),
  );
  return requests;
}
