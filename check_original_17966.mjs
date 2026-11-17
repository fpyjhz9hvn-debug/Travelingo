async function main() {
  const res = await fetch('https://framerusercontent.com/sites/4WqSMIFAZeG7SWw5PJBVnx/ysqa11MKy.fPFGmleE.mjs');
  const text = await res.text();
  const lines = text.split('\n');
  const line7 = lines[6];
  console.log('Original line 7 at 17966:');
  console.log(line7.slice(17900, 18050));
}

main();
