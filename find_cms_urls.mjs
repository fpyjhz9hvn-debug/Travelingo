import fs from 'fs';
import path from 'path';

const CACHE_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache';

function getAllJsFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) getAllJsFiles(full, list);
    else if (e.name.endsWith('.js') || e.name.endsWith('.mjs')) list.push(full);
  }
  return list;
}

const files = getAllJsFiles(CACHE_DIR);
const cmsUrls = new Set();

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  // Match new URL(`./xxx.framercms`, `base`)
  const matches = [...content.matchAll(/new URL\(`([^`]+)`,(?:`|')([^`']+)(?:`|')\)/g)];
  for (const m of matches) {
    const rel = m[1];
    let base = m[2];
    if (base.startsWith('/framerusercontent/')) {
      base = 'https://framerusercontent.com/' + base.replace('/framerusercontent/', '');
    }
    try {
      const full = new URL(rel, base).toString();
      cmsUrls.add(full);
    } catch (e) {
      console.error('URL error:', rel, base);
    }
  }
}

console.log(`Found ${cmsUrls.size} Framer CMS URLs:`);
cmsUrls.forEach(u => console.log('CMS URL:', u));

fs.writeFileSync('C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cms_urls.json', JSON.stringify([...cmsUrls], null, 2));
