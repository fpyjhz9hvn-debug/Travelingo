const fs = require('fs');
const content = fs.readFileSync('C:/Users/viraj/.gemini/antigravity/scratch/traavellio/script_main.mjs', 'utf8');
console.log('Size of script_main.mjs:', content.length);
console.log('First 500 chars:\n', content.slice(0, 500));
console.log('Last 500 chars:\n', content.slice(-500));

// Find imports
const imports = [...content.matchAll(/import\s+[\s\S]*?from\s*['"]([^'"]+)['"]/g)];
console.log('Imports count:', imports.length);
imports.forEach(m => console.log('Import:', m[1]));
