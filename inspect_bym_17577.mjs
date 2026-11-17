import fs from 'fs';

const file = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache/framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx/BymTlK1Lu.BET3lunt.mjs';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);
const line7 = lines[6];
console.log('Line 7 at 17577 (+- 100 chars):');
console.log(line7.slice(17500, 17700));
