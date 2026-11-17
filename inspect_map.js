const fs = require('fs');
const map = JSON.parse(fs.readFileSync('C:/Users/viraj/.gemini/antigravity/scratch/traavellio/script_main.map.json', 'utf8'));
console.log('Source map keys:', Object.keys(map));
console.log('Sources count:', map.sources ? map.sources.length : 0);
if (map.sources) {
  console.log('First 20 sources:\n', map.sources.slice(0, 20));
}
if (map.sourcesContent) {
  console.log('sourcesContent exists! Length:', map.sourcesContent.length);
  console.log('Sample source code:\n', map.sourcesContent[0]?.slice(0, 300));
}
