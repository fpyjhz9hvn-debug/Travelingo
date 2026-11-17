import fs from 'fs';
import path from 'path';

const CACHE_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache';

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

function urlToLocalPath(u) {
  const parsed = new URL(u);
  let relPath = path.join(parsed.hostname, parsed.pathname.replace(/^\//, ''));
  return path.join(CACHE_DIR, relPath);
}

async function downloadCMS() {
  const cmsUrls = JSON.parse(fs.readFileSync('C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cms_urls.json', 'utf8'));
  console.log(`Downloading ${cmsUrls.length} CMS files...`);
  for (const u of cmsUrls) {
    const local = urlToLocalPath(u);
    if (!fs.existsSync(local)) {
      await ensureDir(path.dirname(local));
      try {
        const res = await fetch(u);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(local, buf);
          console.log(`Downloaded CMS: ${path.basename(local)} (${buf.length} bytes)`);
        } else {
          console.warn(`Failed CMS ${res.status}: ${u}`);
        }
      } catch (e) {
        console.error(`Error downloading ${u}:`, e.message);
      }
    } else {
      console.log(`CMS cached: ${path.basename(local)}`);
    }
  }
}

function fixJsFiles() {
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
  let fixedCount = 0;

  for (const f of files) {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;

    // Pattern: new URL(`...`, `/framerusercontent/...`)
    // Replace `/framerusercontent/modules/...` with `(typeof location<"u"?location.origin:"http://localhost:3000") + '/framerusercontent/modules/...'`
    // Or in template string: `${typeof location<"u"?location.origin:""}/framerusercontent/modules/...`
    content = content.replace(/new URL\((`[^`]+`),\s*`\/framerusercontent\/([^`]+)`\)/g, (match, rel, p) => {
      return `new URL(${rel}, (typeof location<"u"?location.origin:"http://localhost:3000") + '/framerusercontent/${p}')`;
    });

    if (content !== original) {
      fs.writeFileSync(f, content, 'utf8');
      fixedCount++;
      console.log(`Fixed new URL in: ${path.basename(f)}`);
    }
  }

  console.log(`Fixed ${fixedCount} files.`);
}

async function main() {
  await downloadCMS();
  fixJsFiles();
  console.log('Hydration fix applied successfully!');
}

main();
