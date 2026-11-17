import fs from 'fs';
import path from 'path';

const CACHE_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache';

// 1. Copy all framercms files to cms directory as well
function syncCmsFiles() {
  const modulesDir = path.join(CACHE_DIR, 'framerusercontent.com', 'modules');
  const cmsDir = path.join(CACHE_DIR, 'framerusercontent.com', 'cms');

  function scan(dir) {
    if (!fs.existsSync(dir)) return [];
    let results = [];
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) results = results.concat(scan(full));
      else if (f.name.endsWith('.framercms')) results.push(full);
    }
    return results;
  }

  const found = scan(modulesDir);
  console.log(`Syncing ${found.length} CMS files to /cms/ directory...`);
  for (const f of found) {
    const rel = path.relative(modulesDir, f);
    const dest = path.join(cmsDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(f, dest);
    console.log(`Copied to CMS: ${rel}`);
  }
}

// 2. Patch all JS files
function patchJsFiles() {
  function getAllJsFiles(dir, list = []) {
    if (!fs.existsSync(dir)) return list;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) getAllJsFiles(full, list);
      else if (e.name.endsWith('.js') || e.name.endsWith('.mjs')) list.push(full);
    }
    return list;
  }

  const files = getAllJsFiles(CACHE_DIR);
  let patchedCount = 0;

  for (const f of files) {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;

    // Fix 1: let a=new URL(e) -> let a=new URL(e,typeof location<"u"?location.origin:"http://localhost:3000")
    // Match let a=new URL(e) or var a=new URL(e)
    content = content.replace(/\blet\s+([a-zA-Z0-9_$]+)\s*=\s*new\s+URL\(([a-zA-Z0-9_$]+)\)/g, (match, varName, argName) => {
      return `let ${varName}=new URL(${argName},(typeof location<"u"?location.origin:"http://localhost:3000"))`;
    });

    // Fix 2: new URL(`./...framercms`, base)
    // Ensure base is an absolute URL with scheme
    // If it starts with /framerusercontent/ or has broken string concatenation
    content = content.replace(/new URL\((`[^`]+`),\s*(?:\(typeof location<"u"\?location\.origin:"http:\/\/localhost:3000"\)\s*\+\s*)?['"`]\/framerusercontent\/([^'"`]+)['"`]\)/g, (match, rel, p) => {
      return `new URL(${rel}, (typeof location<"u"?location.origin:"http://localhost:3000") + '/framerusercontent/${p}')`;
    });

    // Also match any remaining new URL(rel, '/framerusercontent/...')
    content = content.replace(/new URL\(([^,]+),\s*['"`]\/framerusercontent\/([^'"`]+)['"`]\)/g, (match, rel, p) => {
      return `new URL(${rel}, (typeof location<"u"?location.origin:"http://localhost:3000") + '/framerusercontent/${p}')`;
    });

    // Fix 3: In case new URL(e, t) was called with t being relative:
    // Ensure any new URL(...) has fallback base
    content = content.replace(/new URL\(([a-zA-Z0-9_$]+),\s*([a-zA-Z0-9_$]+)\?\?document\.baseURI\)/g, (match, a1, a2) => {
      return `new URL(${a1}, ${a2} || (typeof location<"u"?location.origin:"http://localhost:3000"))`;
    });

    if (content !== original) {
      fs.writeFileSync(f, content, 'utf8');
      patchedCount++;
      console.log(`Patched: ${path.basename(f)}`);
    }
  }

  console.log(`Patched ${patchedCount} JS files.`);
}

syncCmsFiles();
patchJsFiles();
console.log('All patches complete!');
