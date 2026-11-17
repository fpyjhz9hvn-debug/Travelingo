const fs = require('fs');
const html = fs.readFileSync('C:/Users/viraj/.gemini/antigravity/scratch/traavellio/index.html', 'utf8');
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
scripts.forEach((s, i) => {
  console.log(`\n--- SCRIPT ${i} ---`);
  console.log('Attrs:', s[1].trim());
  if (s[2].trim().length > 0) {
    console.log('Inner (first 200 chars):', s[2].trim().slice(0, 200));
  }
});
