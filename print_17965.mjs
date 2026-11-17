import fs from 'fs';

const file = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache/framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx/ysqa11MKy.fPFGmleE.mjs';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const line7 = lines[6];

console.log('Characters 17965 to 18200:');
console.log(line7.slice(17965, 18200));
