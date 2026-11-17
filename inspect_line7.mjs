import fs from 'fs';

const file = 'C:/Users/viraj/.gemini/antigravity/scratch/traavellio/cdn_cache/framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx/ysqa11MKy.fPFGmleE.mjs';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);
if (lines.length >= 7) {
  const line7 = lines[6]; // 0-indexed line 7
  console.log('Line 7 length:', line7.length);
  console.log('Line 7 at 17966 (+- 50 chars):');
  console.log(line7.slice(17900, 18050));
}
