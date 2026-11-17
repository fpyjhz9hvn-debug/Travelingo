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
console.log(`Checking ${files.length} JS files...`);

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const matches = [...content.matchAll(/new URL\([^)]+\)/g)];
  if (matches.length > 0) {
    console.log(`\nFile: ${path.basename(f)} (${matches.length} matches)`);
    matches.slice(0, 5).forEach(m => console.log('  ', m[0]));
  }
}
