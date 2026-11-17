import fs from 'fs';

const assets = JSON.parse(fs.readFileSync('C:/Users/viraj/.gemini/antigravity/scratch/traavellio/discovered_assets.json', 'utf8'));

const categories = {
  images: 0,
  scripts: 0,
  fonts: 0,
  other: 0,
  domains: {}
};

assets.forEach(u => {
  try {
    const parsed = new URL(u);
    categories.domains[parsed.hostname] = (categories.domains[parsed.hostname] || 0) + 1;
    if (u.match(/\.(png|jpg|jpeg|webp|avif|svg|gif)($|\?)/i) || u.includes('/images/')) {
      categories.images++;
    } else if (u.match(/\.(mjs|js)($|\?)/i) || u.includes('/sites/')) {
      categories.scripts++;
    } else if (u.match(/\.(woff2?|ttf|otf)($|\?)/i) || u.includes('fonts.gstatic.com')) {
      categories.fonts++;
    } else {
      categories.other++;
    }
  } catch (e) {}
});

console.log('Categories:', categories);
