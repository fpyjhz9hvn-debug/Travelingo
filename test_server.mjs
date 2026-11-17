import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const srv = spawn(process.execPath, [path.join(projectDir, 'server.mjs')], {
  env: { ...process.env, PORT: '3456' },
  stdio: 'inherit'
});

setTimeout(async () => {
  try {
    console.log('Testing localhost:3456...');
    const res = await fetch('http://127.0.0.1:3456/');
    console.log('Status /:', res.status, res.headers.get('content-type'));
    const text = await res.text();
    console.log('Length /:', text.length);

    const resTour = await fetch('http://127.0.0.1:3456/tours/paris-begins');
    console.log('Status /tours/paris-begins:', resTour.status, resTour.headers.get('content-type'));

    const resAsset = await fetch('http://127.0.0.1:3456/framerusercontent/images/YztfODk5VHe8ZauWauvFwWS18.png');
    console.log('Status asset:', resAsset.status, resAsset.headers.get('content-type'), 'size:', (await resAsset.arrayBuffer()).byteLength);

    const resMissing = await fetch('http://127.0.0.1:3456/route-that-does-not-exist');
    console.log('Status missing route:', resMissing.status);

    const resTraversal = await fetch('http://127.0.0.1:3456/framerusercontent/%2e%2e/%2e%2e/package.json');
    console.log('Status traversal probe:', resTraversal.status);

    if (!res.ok || !resTour.ok || !resAsset.ok || resMissing.status !== 404 || resTraversal.status < 400) {
      throw new Error('One or more local server probes failed.');
    }
    console.log('All test probes passed successfully!');
  } catch (e) {
    console.error('Probe failed:', e);
  } finally {
    srv.kill();
    process.exit(0);
  }
}, 800);
