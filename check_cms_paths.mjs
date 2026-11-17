import fs from 'fs';
import path from 'path';

const CACHE_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache';

function findFiles(dir, filter, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) findFiles(full, filter, list);
    else if (filter(f.name)) list.push(full);
  }
  return list;
}

const cmsFiles = findFiles(CACHE_DIR, n => n.endsWith('.framercms'));
console.log(`Found ${cmsFiles.length} .framercms files in cache:`);
cmsFiles.forEach(f => console.log(' ->', f));
