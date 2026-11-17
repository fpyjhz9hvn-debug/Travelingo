import fs from 'fs';

const file = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache/framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx/ysqa11MKy.fPFGmleE.mjs';
const content = fs.readFileSync(file, 'utf8');

console.log('Position 17800-18200:');
console.log(content.slice(17800, 18200));

// Also let's check where 17966 is exactly:
console.log('\nExact 17966 context:');
console.log(content.slice(17940, 18000));
