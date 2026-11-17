import fs from 'fs';

const file = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache/framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx/ysqa11MKy.fPFGmleE.mjs';
const content = fs.readFileSync(file, 'utf8');

console.log('Index 26550-26800:');
console.log(content.slice(26550, 26800));

console.log('\nIndex 4500-4560:');
console.log(content.slice(4500, 4560));
