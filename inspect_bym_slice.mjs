import fs from 'fs';

const file = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache/framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx/BymTlK1Lu.BET3lunt.mjs';
const content = fs.readFileSync(file, 'utf8');

console.log('Index 4520-4620:');
console.log(content.slice(4520, 4620));

console.log('\nIndex 26230-26330:');
console.log(content.slice(26230, 26330));
