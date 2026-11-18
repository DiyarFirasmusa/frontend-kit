import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

// Serves the client build the way the production host must (framework.md): real files
// as-is, every other path gets /_shell.html. `vite preview` is not used because on Start
// it runs the SSR server bundle, whose route guards see no session and 307 every
// signed-in deep link (/orders, a reload) to /login.

const [rootArg, portArg] = process.argv.slice(2);
if (!rootArg || !portArg) {
  throw new Error("Usage: node e2e/serve-spa.ts <client-build-dir> <port>");
}
const root = resolve(rootArg);
const port = Number(portArg);
const shell = join(root, "_shell.html");

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

async function resolveFile(pathname: string): Promise<string> {
  const candidate = normalize(join(root, decodeURIComponent(pathname)));
  // Never serve outside the build folder (`/../`).
  if (!candidate.startsWith(root + sep)) {
    return shell;
  }
  try {
    const info = await stat(candidate);
    return info.isFile() ? candidate : shell;
  } catch {
    return shell;
  }
}

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? "/", "http://localhost");
  void resolveFile(pathname).then((file) => {
    response.writeHead(200, {
      "Content-Type":
        CONTENT_TYPES[extname(file)] ?? "application/octet-stream",
    });
    createReadStream(file).pipe(response);
  });
}).listen(port, "127.0.0.1");
