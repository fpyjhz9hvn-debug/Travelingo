import fs from 'fs';
import path from 'path';

const file = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache/framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx/ysqa11MKy.fPFGmleE.mjs';
const content = fs.readFileSync(file, 'utf8');

console.log('--- At position 4450-4600 ---');
console.log(content.slice(4450, 4600));

console.log('\n--- At position 26500-26700 ---');
console.log(content.slice(26500, 26700));

// Find all "new URL(" in the file
console.log('\n--- All occurrences of new URL ---');
const regex = /new URL\([^)]+\)/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log(`Index ${m.index}: ${m[0]}`);
}
