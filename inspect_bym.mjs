import fs from 'fs';

const file = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache/framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx/BymTlK1Lu.BET3lunt.mjs';
const content = fs.readFileSync(file, 'utf8');

console.log('Size of BymTlK1Lu:', content.length);
const matches = [...content.matchAll(/new URL\([^)]+\)/g)];
console.log(`Found ${matches.length} occurrences of new URL:`);
matches.forEach((m, i) => {
  console.log(`[${i}] Index ${m.index}: ${m[0]}`);
});
