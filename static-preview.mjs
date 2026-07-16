import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const port = 3000;
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function resolveFile(url) {
  const cleanUrl = decodeURIComponent(url.split("?")[0] ?? "/");
  if (cleanUrl === "/" || cleanUrl === "") {
    return path.join(root, ".next", "server", "app", "index.html");
  }
  if (cleanUrl.startsWith("/_next/static/")) {
    return path.join(root, cleanUrl.slice(1));
  }
  const publicFile = path.join(root, "public", cleanUrl);
  if (existsSync(publicFile)) return publicFile;
  const appFile = path.join(root, ".next", "server", "app", cleanUrl, "index.html");
  if (existsSync(appFile)) return appFile;
  return path.join(root, ".next", "server", "app", "index.html");
}

createServer(async (req, res) => {
  try {
    const file = resolveFile(req.url ?? "/");
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": types[path.extname(file)] ?? "application/octet-stream",
      "cache-control": "no-store"
    });
    res.end(body);
  } catch (error) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Prévia não encontrada. Rode npm run build novamente.");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Prévia aberta em http://127.0.0.1:${port}`);
});
