import fs from 'fs';
import path from 'path';

const CACHE_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache';

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

function urlToLocalPath(u) {
  try {
    const parsed = new URL(u);
    let relPath = path.join(parsed.hostname, parsed.pathname.replace(/^\//, ''));
    return path.join(CACHE_DIR, relPath);
  } catch (e) {
    return null;
  }
}

async function downloadWithRetry(u, retries = 2) {
  const localPath = urlToLocalPath(u);
  if (!localPath) return { success: false, url: u, error: 'Invalid URL' };
  
  if (fs.existsSync(localPath)) {
    const stat = await fs.promises.stat(localPath);
    if (stat.size > 0) {
      return { success: true, url: u, path: localPath, cached: true };
    }
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await ensureDir(path.dirname(localPath));
      const res = await fetch(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!res.ok) {
        if (res.status === 404) return { success: false, url: u, error: '404' };
        throw new Error(`HTTP ${res.status}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.promises.writeFile(localPath, buf);
      return { success: true, url: u, path: localPath, size: buf.length };
    } catch (err) {
      if (attempt === retries) {
        return { success: false, url: u, error: err.message };
      }
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

async function pool(items, concurrency, fn, onProgress) {
  let index = 0;
  let active = 0;
  let completed = 0;
  const results = [];

  return new Promise((resolve) => {
    function next() {
      if (index >= items.length && active === 0) {
        return resolve(results);
      }
      while (active < concurrency && index < items.length) {
        const item = items[index++];
        active++;
        fn(item).then((res) => {
          results.push(res);
          active--;
          completed++;
          if (completed % 50 === 0 || completed === items.length) {
            onProgress(completed, items.length);
          }
          next();
        });
      }
    }
    next();
  });
}

async function main() {
  const assets = JSON.parse(await fs.promises.readFile('C:/Users/viraj/.gemini/antigravity/scratch/traavellio/discovered_assets.json', 'utf8'));
  console.log(`Starting download of ${assets.length} total assets with concurrency 15...`);

  const results = await pool(assets, 15, downloadWithRetry, (done, total) => {
    console.log(`Progress: ${done} / ${total} (${Math.round((done / total) * 100)}%)`);
  });

  const success = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success);
  console.log(`Download complete! Success: ${success}, Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log('Sample failed URLs:', failed.slice(0, 10));
  }
}

main();
