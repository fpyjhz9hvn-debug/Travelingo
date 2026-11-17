import fs from 'fs';
import path from 'path';

const SITE_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/site';
const CACHE_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache';

async function getAllFiles(dir, exts, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await getAllFiles(full, exts, fileList);
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      fileList.push(full);
    }
  }
  return fileList;
}

async function rewriteFile(filePath, isHtml) {
  let content = await fs.promises.readFile(filePath, 'utf8');
  let original = content;

  // Replace origins
  content = content.replaceAll('https://traavellio.framer.website/', '/');
  content = content.replaceAll('https://traavellio.framer.website', '');
  content = content.replaceAll('https://framerusercontent.com/', '/framerusercontent/');
  content = content.replaceAll('https://framerusercontent.com', '/framerusercontent');
  content = content.replaceAll('https://fonts.gstatic.com/', '/fonts-gstatic/');
  content = content.replaceAll('https://fonts.gstatic.com', '/fonts-gstatic');

  if (isHtml) {
    // Disable events.framer.com tracking
    content = content.replaceAll('https://events.framer.com/script?v=2', 'data:text/javascript,void%200');
  }

  if (content !== original) {
    await fs.promises.writeFile(filePath, content, 'utf8');
    return true;
  }
  return false;
}

async function main() {
  console.log('Finding HTML files to rewrite...');
  const htmlFiles = await getAllFiles(SITE_DIR, ['.html']);
  let rewrittenHtml = 0;
  for (const f of htmlFiles) {
    if (await rewriteFile(f, true)) rewrittenHtml++;
  }
  console.log(`Rewrote ${rewrittenHtml} / ${htmlFiles.length} HTML files.`);

  console.log('Finding JS/MJS files in cache to rewrite...');
  const jsFiles = await getAllFiles(CACHE_DIR, ['.js', '.mjs']);
  let rewrittenJs = 0;
  for (const f of jsFiles) {
    if (await rewriteFile(f, false)) rewrittenJs++;
  }
  console.log(`Rewrote ${rewrittenJs} / ${jsFiles.length} JS/MJS files.`);
}

main();
