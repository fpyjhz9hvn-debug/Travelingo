import fs from 'fs';

const file = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache/framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx/ysqa11MKy.fPFGmleE.mjs';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const line7 = lines[6];

// Find new URL( in line 7
const matches = [...line7.matchAll(/new URL\([^)]+\)/g)];
matches.slice(0, 3).forEach((m, i) => {
  console.log(`\nMatch ${i} at index ${m.index}:`);
  console.log(m[0]);
});
