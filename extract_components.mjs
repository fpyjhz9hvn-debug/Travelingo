import fs from 'fs';
import path from 'path';

const CACHE_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache';
const EXTRACT_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/extracted_source';
const COMPONENTS_DIR = path.join(EXTRACT_DIR, 'components');
const ASSET_LIB_DIR = path.join(EXTRACT_DIR, 'asset-library');

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function findMapFiles(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await findMapFiles(full, list);
    } else if (entry.name.endsWith('.map') || entry.name.endsWith('.map.json')) {
      list.push(full);
    }
  }
  return list;
}

function cleanSourcePath(srcPath) {
  // Convert URL like https:/framerusercontent.com/modules/abc/def/ComponentName.js
  let clean = srcPath.replace(/https?:\/+/g, '');
  clean = clean.replace(/[?#].*$/, '');
  return clean;
}

async function main() {
  await ensureDir(COMPONENTS_DIR);
  await ensureDir(ASSET_LIB_DIR);

  const mapFiles = await findMapFiles(CACHE_DIR);
  console.log(`Found ${mapFiles.length} source map files.`);

  let totalExtracted = 0;
  const catalog = [];

  for (const mapFile of mapFiles) {
    try {
      const content = await fs.promises.readFile(mapFile, 'utf8');
      const map = JSON.parse(content);
      if (!map.sources || !map.sourcesContent) continue;

      for (let i = 0; i < map.sources.length; i++) {
        const srcName = map.sources[i];
        const srcCode = map.sourcesContent[i];
        if (!srcCode) continue;

        const baseName = path.basename(srcName);
        let destFolder = COMPONENTS_DIR;
        if (srcName.includes('phosphor') || srcName.includes('icon') || srcName.includes('svg')) {
          destFolder = ASSET_LIB_DIR;
        }

        const outPath = path.join(destFolder, baseName.endsWith('.js') || baseName.endsWith('.jsx') || baseName.endsWith('.tsx') ? baseName : `${baseName}.jsx`);
        await fs.promises.writeFile(outPath, srcCode, 'utf8');
        totalExtracted++;
        catalog.push({
          sourceName: srcName,
          baseName,
          category: destFolder === ASSET_LIB_DIR ? 'icon/asset' : 'component',
          size: srcCode.length,
          outPath
        });
      }
    } catch (err) {
      console.error(`Error processing ${mapFile}:`, err.message);
    }
  }

  const manifestPath = path.join(EXTRACT_DIR, 'catalog.json');
  await fs.promises.writeFile(manifestPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`Extracted ${totalExtracted} original source files and components!`);
  console.log(`Catalog saved to ${manifestPath}`);
}

main();
