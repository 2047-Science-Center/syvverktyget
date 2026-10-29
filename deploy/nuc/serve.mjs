#!/usr/bin/env node
/**
 * Minimal, beroendefri statisk filserver för SYV-verktygets byggda `dist/`.
 *
 * Varför egen (och inte `python3 -m http.server`): mirror av forhandlingens
 * server+systemd+/healthz-mönster så kiosken kan vänta in hälsokollen innan
 * fönstret öppnas — bara statisk i stället för WS-relä. Node krävs ändå för
 * att bygga appen, så noll extra beroenden.
 *
 * PORTSÄKERT & SAMEXISTENS PÅ DELAD NUC:
 *   - PORT är OBLIGATORISK (env PORT eller --port). Ingen default-port =
 *     omöjligt att av misstag krocka med något annat som redan kör.
 *   - Binder till 127.0.0.1 som default (HOST) → inget exponeras på nätet,
 *     bara den lokala kiosken når den.
 *
 * Körs av systemd-tjänsten (se syvverktyget-server.service), som install.sh
 * fyller i med vald port. Manuellt för test:
 *   PORT=8791 node deploy/nuc/serve.mjs
 *   node deploy/nuc/serve.mjs --port 8791 --dir dist --host 127.0.0.1
 *
 * Appen är hash-routad (kiosken öppnar `…/#...`), så ingen history-fallback
 * behövs — okända sökvägar ger 404 (utom `/` → index.html).
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, normalize, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = fileURLToPath(new URL('.', import.meta.url))

// --- Argument / env ---
const args = process.argv.slice(2)
function flag(name) {
  const i = args.indexOf(name)
  return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined
}

const PORT = Number(flag('--port') ?? process.env.PORT)
const HOST = flag('--host') ?? process.env.HOST ?? '127.0.0.1'
// dist/ ligger i repo-roten, två nivåer upp från deploy/nuc/.
const DIR = resolve(flag('--dir') ?? process.env.DIR ?? join(HERE, '..', '..', 'dist'))

if (!Number.isInteger(PORT) || PORT <= 0 || PORT > 65535) {
  console.error('serve.mjs: ange en giltig PORT (env PORT eller --port <n>). Ingen default — undviker portkrockar.')
  process.exit(1)
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)

    // Hälsokoll för systemd/kiosk-väntan (mirror av forhandlingens /healthz).
    if (url.pathname === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('ok')
      return
    }

    // Normalisera och spärra traversal utanför DIR.
    let pathname = decodeURIComponent(url.pathname)
    if (pathname === '/' || pathname === '') pathname = '/index.html'
    const filePath = normalize(join(DIR, pathname))
    if (!filePath.startsWith(DIR)) {
      res.writeHead(403)
      res.end('forbidden')
      return
    }

    let target = filePath
    try {
      const s = await stat(target)
      if (s.isDirectory()) target = join(target, 'index.html')
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('not found')
      return
    }

    const body = await readFile(target)
    const type = TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream'
    // index.html får inte cachas (så en uppdaterad build syns direkt);
    // övriga assets är hash-namnade av Vite → kan cachas hårt.
    const cache = target.endsWith('index.html')
      ? 'no-cache'
      : 'public, max-age=31536000, immutable'
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache })
    res.end(body)
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('server error')
    console.error('serve.mjs:', err?.message ?? err)
  }
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`serve.mjs: PORT ${PORT} är upptagen på ${HOST}. Välj en ledig port (se INSTALL-NUC.md: ss -ltnp).`)
  } else {
    console.error('serve.mjs:', err.message)
  }
  process.exit(1)
})

server.listen(PORT, HOST, () => {
  console.log(`serve.mjs: SYV-verktyget på http://${HOST}:${PORT}  (dist: ${DIR})`)
})
