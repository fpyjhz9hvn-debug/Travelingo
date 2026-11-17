import fs from 'fs';

const file = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache/framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx/react.DSnRm1JM.mjs';
const content = fs.readFileSync(file, 'utf8');

console.log('Size of react.DSnRm1JM.mjs:', content.length);
const matches = [...content.matchAll(/new URL\([^)]+\)/g)];
console.log('Matches in react.DSnRm1JM.mjs:');
matches.forEach(m => console.log(' ->', m[0]));

// Also check any "URL" in react.DSnRm1JM.mjs
const allUrl = [...content.matchAll(/URL/g)];
console.log('Total URL count:', allUrl.length);
allUrl.forEach(m => {
  console.log('Context:', content.slice(Math.max(0, m.index - 30), Math.min(content.length, m.index + 50)));
});
