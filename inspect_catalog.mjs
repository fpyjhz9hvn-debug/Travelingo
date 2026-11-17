import fs from 'fs';

const catalog = JSON.parse(fs.readFileSync('C:/Users/viraj/.gemini/antigravity/scratch/traavellio/extracted_source/catalog.json', 'utf8'));

console.log(`Total items in catalog: ${catalog.length}`);
const sample = catalog.map(c => ({ baseName: c.baseName, category: c.category, size: c.size }));
console.log('Sample extracted items (first 30):', sample.slice(0, 30));

const categories = {};
catalog.forEach(c => {
  categories[c.category] = (categories[c.category] || 0) + 1;
});
console.log('Category breakdown:', categories);
