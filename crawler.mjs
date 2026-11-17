import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://traavellio.framer.website';
const OUTPUT_DIR = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/site';

const PAGES = [
  '/',
  '/book-a-trip',
  '/about',
  '/blogs',
  '/tours',
  '/destinations/japan',
  '/destinations/switzerland',
  '/destinations/paris',
  '/destinations/new-york',
  '/blogs/discovering-island-life-beyond-luxury',
  '/blogs/experiencing-europe-beyond-tourist-routes',
  '/blogs/discovering-the-calm-of-mountain-travel',
  '/blogs/discovering-the-soul-of-bali',
  '/activities/camping-outdoor',
  '/activities/water-adventures',
  '/activities/mountain-expeditions',
  '/activities/ski-snow-adventures',
  '/tours/morocco-cultural-desert-journey',
  '/tours/italy-classic-discovery',
  '/tours/paris-classics',
  '/tours/paris-cultural-getaway',
  '/tours/africa-safari-experience',
  '/tours/new-york-highlights-copy',
  '/tours/spain-cultural-trail',
  '/tours/bali-cultural-retreat',
  '/tours/japan-spring-highlights',
  '/tours/switzerland-explore',
  '/tours/switzerland-classic',
  '/tours/japan-begins-tour',
  '/tours/india-heritage-culture',
  '/tours/switzerland-nature-s',
  '/tours/japan-nature',
  '/tours/paris-begins',
  '/tours/new-york-highlights',
  '/tours/switzerland-alpine-escape',
  '/tours/new-york-experience',
  '/tours/new-york-highlights-copy-copy',
  '/tours/japan-culture-tour',
  '/tours/iceland-nature-landscapes',
  '/tours/dubai-modern-escape',
  '/tours/australia-highlights',
  '/tours/discover-egypt',
  '/policies/privacy-policy',
  '/policies/terms-conditions',
  '/404'
];

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function fetchPage(pagePath) {
  const url = `${BASE_URL}${pagePath}`;
  console.log(`Fetching: ${url}`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`HTTP ${res.status} for ${url}`);
      return null;
    }
    const html = await res.text();
    
    // Save to disk
    let relFile = pagePath === '/' ? 'index.html' : `${pagePath.replace(/^\//, '')}/index.html`;
    const targetPath = path.join(OUTPUT_DIR, relFile);
    await ensureDir(path.dirname(targetPath));
    await fs.promises.writeFile(targetPath, html, 'utf8');
    console.log(`Saved: ${targetPath} (${html.length} bytes)`);
    return html;
  } catch (err) {
    console.error(`Failed to fetch ${url}:`, err.message);
    return null;
  }
}

async function main() {
  await ensureDir(OUTPUT_DIR);
  console.log(`Starting crawl of ${PAGES.length} pages...`);
  
  for (const page of PAGES) {
    await fetchPage(page);
  }
  
  console.log('All pages crawled successfully!');
}

main();
