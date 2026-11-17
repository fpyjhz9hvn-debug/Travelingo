import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const SITE_DIR = path.join(__dirname, 'site');
const CACHE_DIR = path.join(__dirname, 'cdn_cache');

// Keep every routed path inside its intended content directory. URL paths can
// contain encoded traversal segments, so normalize and verify before serving.
function resolveInside(root, relativePath) {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, relativePath);
  return resolvedPath === resolvedRoot || resolvedPath.startsWith(resolvedRoot + path.sep)
    ? resolvedPath
    : null;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.framercms': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function serveFile(req, res, filePath, contentType) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const mime = contentType || MIME_TYPES[ext] || 'application/octet-stream';
    const stat = await fs.promises.stat(filePath);
    const range = req.headers.range;

    const isCode = ext === '.js' || ext === '.mjs' || ext === '.html' || ext === '.json';
    const cacheHeader = isCode ? 'no-cache, no-store, must-revalidate' : 'public, max-age=86400';

    const baseHeaders = {
      'Content-Type': mime,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
      'Accept-Ranges': 'bytes',
      'Cache-Control': cacheHeader
    };

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

      if (start >= stat.size || end >= stat.size) {
        res.writeHead(416, {
          ...baseHeaders,
          'Content-Range': `bytes */${stat.size}`
        });
        return res.end();
      }

      const chunksize = end - start + 1;
      res.writeHead(206, {
        ...baseHeaders,
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Content-Length': chunksize
      });

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        ...baseHeaders,
        'Content-Length': stat.size
      });
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Error reading file: ${err.message}`);
  }
}

// Framer's CMS runtime requests compact binary files with a `?range=a-b,c-d`
// parameter (end offsets are exclusive). A normal full-file response has a
// different byte length, so the runtime rejects it and clears the hydrated
// page while scrolling. Return the requested byte slices in order.
async function serveCmsRanges(req, res, filePath, rangeParam) {
  try {
    const stat = await fs.promises.stat(filePath);
    const ranges = rangeParam.split(',').map((part) => {
      const match = /^(\d+)-(\d+)$/.exec(part);
      if (!match) return null;
      const start = Number(match[1]);
      const endExclusive = Number(match[2]);
      if (start >= endExclusive || endExclusive > stat.size) return null;
      return { start, endExclusive };
    });
    if (!ranges.length || ranges.some((range) => !range)) {
      res.writeHead(416, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Invalid CMS byte range');
    }

    const source = await fs.promises.readFile(filePath);
    const chunks = ranges.map(({ start, endExclusive }) => source.subarray(start, endExclusive));
    const body = Buffer.concat(chunks);
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': body.length,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Error reading CMS data: ${err.message}`);
  }
}

async function proxyAndCache(req, res, remoteUrl, localPath, contentType) {
  try {
    console.log(`[Proxy Fetch] ${remoteUrl}`);
    const fetchHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    if (req.headers.range) {
      fetchHeaders.range = req.headers.range;
    }

    const fetchRes = await fetch(remoteUrl, { headers: fetchHeaders });

    if (!fetchRes.ok && fetchRes.status !== 206) {
      res.writeHead(fetchRes.status, { 'Content-Type': 'text/plain' });
      return res.end(`Upstream returned ${fetchRes.status}`);
    }

    const buf = Buffer.from(await fetchRes.arrayBuffer());
    if (!req.headers.range) {
      await ensureDir(path.dirname(localPath));
      await fs.promises.writeFile(localPath, buf);
    }

    const ext = path.extname(localPath).toLowerCase();
    const mime = contentType || MIME_TYPES[ext] || fetchRes.headers.get('content-type') || 'application/octet-stream';

    const respHeaders = {
      'Content-Type': mime,
      'Content-Length': buf.length,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400'
    };
    if (fetchRes.headers.get('content-range')) {
      respHeaders['Content-Range'] = fetchRes.headers.get('content-range');
    }

    res.writeHead(fetchRes.status, respHeaders);
    res.end(buf);
  } catch (err) {
    console.error(`[Proxy Error] ${remoteUrl}:`, err.message);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Proxy error: ${err.message}`);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400'
      });
      return res.end();
    }

    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(reqUrl.pathname);

    // 1. Framerusercontent asset handling
    if (pathname.startsWith('/framerusercontent/')) {
      const subPath = pathname.replace('/framerusercontent/', '');
      let localPath = resolveInside(path.join(CACHE_DIR, 'framerusercontent.com'), subPath);
      if (!localPath) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Invalid asset path');
      }

      // Framer sometimes asks for a ranged CMS blob through its /modules/ URL.
      // Prefer the matching binary CMS file so the response length matches.
      if (reqUrl.searchParams.has('range') && subPath.startsWith('modules/')) {
        const cmsPath = resolveInside(path.join(CACHE_DIR, 'framerusercontent.com'), subPath.replace('modules/', 'cms/'));
        if (cmsPath && fs.existsSync(cmsPath)) localPath = cmsPath;
      }
      
      // If cms chunk requested, try cms/ then modules/
      if (subPath.startsWith('cms/') && !fs.existsSync(localPath)) {
        const alt = resolveInside(path.join(CACHE_DIR, 'framerusercontent.com'), subPath.replace('cms/', 'modules/'));
        if (fs.existsSync(alt)) localPath = alt;
      } else if (subPath.startsWith('modules/') && !fs.existsSync(localPath)) {
        const alt = resolveInside(path.join(CACHE_DIR, 'framerusercontent.com'), subPath.replace('modules/', 'cms/'));
        if (fs.existsSync(alt)) localPath = alt;
      }

      if (fs.existsSync(localPath)) {
        const cmsRanges = path.extname(localPath).toLowerCase() === '.framercms' && reqUrl.searchParams.get('range');
        if (cmsRanges) return serveCmsRanges(req, res, localPath, cmsRanges);
        return serveFile(req, res, localPath);
      } else {
        const remoteUrl = `https://framerusercontent.com/${subPath}`;
        return proxyAndCache(req, res, remoteUrl, localPath);
      }
    }

    // 2. Google Fonts gstatic handling
    if (pathname.startsWith('/fonts-gstatic/')) {
      const subPath = pathname.replace('/fonts-gstatic/', '');
      const localPath = resolveInside(path.join(CACHE_DIR, 'fonts.gstatic.com'), subPath);
      if (!localPath) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Invalid font path');
      }
      if (fs.existsSync(localPath)) {
        return serveFile(req, res, localPath);
      } else {
        const remoteUrl = `https://fonts.gstatic.com/${subPath}`;
        return proxyAndCache(req, res, remoteUrl, localPath);
      }
    }

    // 3. Static pages & routes
    let candidatePaths = [];
    if (pathname === '/' || pathname === '') {
      candidatePaths.push(path.join(SITE_DIR, 'index.html'));
    } else {
      const clean = pathname.replace(/^\//, '').replace(/\/$/, '');
      const pageRoot = resolveInside(SITE_DIR, clean);
      if (!pageRoot) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Invalid page path');
      }
      candidatePaths.push(path.join(pageRoot, 'index.html'));
      candidatePaths.push(`${pageRoot}.html`);
      candidatePaths.push(pageRoot);
    }

    for (const cp of candidatePaths) {
      if (fs.existsSync(cp)) {
        const stat = await fs.promises.stat(cp);
        if (stat.isFile()) {
          return serveFile(req, res, cp);
        }
      }
    }

    // 4. Fallback 404
    const notFoundPage = path.join(SITE_DIR, '404', 'index.html');
    if (fs.existsSync(notFoundPage)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(notFoundPage).pipe(res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Internal Server Error: ${err.message}`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  Traavellio Framer Clone Server Running!`);
  console.log(`  Localhost: http://localhost:${PORT}`);
  console.log(`  Site Directory: ${SITE_DIR}`);
  console.log(`  Cache Directory: ${CACHE_DIR}`);
  console.log(`=======================================================`);
});
