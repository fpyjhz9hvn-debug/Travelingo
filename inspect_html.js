const fs = require('fs');
const html = fs.readFileSync('C:/Users/viraj/.gemini/antigravity/scratch/traavellio/index.html', 'utf8');
console.log('Total length:', html.length);

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
console.log('Script count:', scripts.length);
scripts.forEach((s, i) => {
  console.log(`Script ${i}: attrs = ${s[1].trim().slice(0, 100)}, inner length = ${s[2].length}`);
  if (s[2].length > 0 && s[2].length < 300) {
    console.log(`   content: ${s[2]}`);
  }
});

const links = [...html.matchAll(/<link\b([^>]*)>/gi)];
console.log('Link count:', links.length);
links.slice(0, 15).forEach((l, i) => {
  console.log(`Link ${i}: ${l[1].trim()}`);
});
