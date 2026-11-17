async function main() {
  const res = await fetch('https://framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx/ysqa11MKy.fPFGmleE.mjs');
  const text = await res.text();
  console.log('Original length:', text.length);
  const lines = text.split('\n');
  console.log('Original lines:', lines.length);
  const line7 = lines[6];
  console.log('Original line 7 length:', line7.length);

  const matches = [...line7.matchAll(/new URL\([^)]+\)/g)];
  console.log('Original matches in line 7:');
  matches.slice(0, 5).forEach((m, i) => console.log(`  Match ${i}:`, m[0]));
}

main();
