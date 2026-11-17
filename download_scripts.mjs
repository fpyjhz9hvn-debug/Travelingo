import fs from 'fs';
import path from 'path';

const CACHE_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache';

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

function urlToLocalPath(u) {
  const parsed = new URL(u);
  // hostname / pathname
  let relPath = path.join(parsed.hostname, parsed.pathname.replace(/^\//, ''));
  return path.join(CACHE_DIR, relPath);
}

async function downloadAsset(u) {
  try {
    const localPath = urlToLocalPath(u);
    if (fs.existsSync(localPath)) {
      return localPath;
    }
    await ensureDir(path.dirname(localPath));
    const res = await fetch(u);
    if (!res.ok) {
      console.warn(`Failed (${res.status}): ${u}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.promises.writeFile(localPath, buf);
    return localPath;
  } catch (err) {
    console.error(`Error downloading ${u}:`, err.message);
    return null;
  }
}

async function main() {
  const assets = JSON.parse(await fs.promises.readFile('C:/Users/viraj/.gemini/antigravity/scratch/traavellio/discovered_assets.json', 'utf8'));
  const scripts = assets.filter(u => u.includes('/sites/') || u.endsWith('.mjs') || u.endsWith('.js'));
  console.log(`Downloading ${scripts.length} scripts...`);

  const downloadedScripts = [];
  for (const s of scripts) {
    const p = await downloadAsset(s);
    if (p) downloadedScripts.push({ url: s, path: p });
  }

  console.log(`Downloaded ${downloadedScripts.length} scripts.`);

  // Check for source maps
  const mapUrls = [];
  for (const item of downloadedScripts) {
    const content = await fs.promises.readFile(item.path, 'utf8');
    const match = content.match(/\/\/#\s*sourceMappingURL=([^\s]+)/);
    if (match) {
      const mapRel = match[1];
      const mapUrl = new URL(mapRel, item.url).toString();
      mapUrls.push(mapUrl);
    }
  }

  console.log(`Found ${mapUrls.length} source maps. Downloading...`);
  let downloadedMaps = 0;
  for (const m of mapUrls) {
    const p = await downloadAsset(m);
    if (p) downloadedMaps++;
  }
  console.log(`Downloaded ${downloadedMaps} source maps!`);
}

main();
