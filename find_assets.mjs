import fs from 'fs';
import path from 'path';

const SITE_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/site';
const ASSETS_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/assets';

async function getAllFiles(dir, fileList = []) {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      await getAllFiles(res, fileList);
    } else if (file.name.endsWith('.html')) {
      fileList.push(res);
    }
  }
  return fileList;
}

function extractUrls(html) {
  const urls = new Set();
  
  // framerusercontent URLs (images, modules, fonts, chunks)
  const framerMatches = html.matchAll(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?framerusercontent\.com\/[^\s"'<>\),]+/g);
  for (const m of framerMatches) {
    // Clean trailing quotes, semicolons, brackets
    let clean = m[0].replace(/&quot;.*$/, '').replace(/&amp;/g, '&');
    urls.add(clean);
  }

  // Google fonts or other cdn links
  const fontMatches = html.matchAll(/https?:\/\/fonts\.gstatic\.com\/[^\s"'<>\),]+/g);
  for (const m of fontMatches) {
    urls.add(m[0]);
  }

  // Framer events script or badges
  const eventsMatches = html.matchAll(/https?:\/\/events\.framer\.com\/[^\s"'<>\),]+/g);
  for (const m of eventsMatches) {
    urls.add(m[0]);
  }

  // Links in script / link tags
  const srcMatches = html.matchAll(/(?:src|href)=["']([^"']+)["']/g);
  for (const m of srcMatches) {
    let u = m[1];
    if (u.startsWith('http://') || u.startsWith('https://')) {
      if (u.includes('framerusercontent.com') || u.includes('fonts.gstatic.com')) {
        urls.add(u);
      }
    }
  }

  return urls;
}

async function main() {
  console.log('Finding all HTML files...');
  const htmlFiles = await getAllFiles(SITE_DIR);
  console.log(`Found ${htmlFiles.length} HTML files.`);

  const allUrls = new Set();
  for (const file of htmlFiles) {
    const content = await fs.promises.readFile(file, 'utf8');
    const urls = extractUrls(content);
    for (const u of urls) {
      allUrls.add(u);
    }
  }

  console.log(`Discovered ${allUrls.size} unique remote assets across all pages!`);
  
  // Save list of assets
  const assetListPath = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/discovered_assets.json';
  await fs.promises.writeFile(assetListPath, JSON.stringify([...allUrls], null, 2), 'utf8');
  console.log(`Saved asset list to ${assetListPath}`);
}

main();
