import fs from 'fs';
import path from 'path';

const SITES_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache/framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx';

const files = fs.readdirSync(SITES_DIR).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
console.log(`Checking ${files.length} files in ${SITES_DIR}...`);

const problematicFiles = [];

for (const file of files) {
  const fullPath = path.join(SITES_DIR, file);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Check 1: new URL without base or with /framerusercontent
  const rawRootRelMatches = [...content.matchAll(/new URL\([^,)]+,\s*['"`]\/framerusercontent\/[^'"`]+['"`]\)/g)];
  
  // Check 2: let a=new URL(e) without second argument
  const singleArgMatches = [...content.matchAll(/\b(?:let|var|const)\s+([a-zA-Z0-9_$]+)\s*=\s*new\s+URL\(([a-zA-Z0-9_$]+)\)/g)];

  // Check 3: any other new URL(rel, base)
  const anyNewUrls = [...content.matchAll(/new URL\(([^)]+)\)/g)];

  if (rawRootRelMatches.length > 0 || singleArgMatches.length > 0) {
    problematicFiles.push({
      file,
      rawRootRelMatches: rawRootRelMatches.map(m => m[0].slice(0, 80)),
      singleArgMatches: singleArgMatches.map(m => m[0]),
      totalNewUrls: anyNewUrls.length
    });
  }
}

console.log(`Found ${problematicFiles.length} files needing fixes:`);
problematicFiles.forEach(p => {
  console.log(`\nFile: ${p.file} (Total new URL: ${p.totalNewUrls})`);
  console.log(`  Single-arg new URL count: ${p.singleArgMatches.length}`);
  if (p.singleArgMatches.length) console.log('   Sample:', p.singleArgMatches.slice(0, 3));
  console.log(`  Raw root-relative new URL count: ${p.rawRootRelMatches.length}`);
  if (p.rawRootRelMatches.length) console.log('   Sample:', p.rawRootRelMatches.slice(0, 3));
});
