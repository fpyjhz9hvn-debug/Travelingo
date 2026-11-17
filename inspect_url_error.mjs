import fs from 'fs';
import path from 'path';

const CACHE_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache';

function findFile(dir, name) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      const found = findFile(full, name);
      if (found) return found;
    } else if (f.name.includes(name)) {
      return full;
    }
  }
  return null;
}

const file = findFile(CACHE_DIR, 'ysqa11MKy');
console.log('Found file:', file);
if (file) {
  const content = fs.readFileSync(file, 'utf8');
  console.log('Size:', content.length);
  const matches = [...content.matchAll(/new URL\([^)]+\)/g)];
  console.log('new URL occurrences:');
  matches.forEach(m => console.log(m[0]));

  // Also check URL construction or origin references
  const originMatches = [...content.matchAll(/.{0,50}(?:origin|URL|location).{0,50}/g)];
  console.log('Origin/URL/location context (first 10):');
  originMatches.slice(0, 10).forEach(m => console.log(' ->', m[0]));
}
