// Optional integration check: Windows Edge, Node 22+; no npm dependencies.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname.startsWith('/api/')) { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end('{"error":"Test server: no session"}'); return; }
    const relative = pathname.startsWith('/avanzada/') ? 'CleanBot_Simulacion_Avanzada/static/' + pathname.slice(10) : pathname === '/' ? 'index.html' : pathname.slice(1);
    const target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    fs.readFile(target, (error, bytes) => {
      if (error) { res.writeHead(404); res.end(); return; }
      res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css' })[path.extname(target)] || 'application/octet-stream');
      if (relative === 'dashboard-3d.js') bytes = Buffer.from(bytes.toString() + `\nglobalThis.__obstacleTest = { auth, sim, ui, SCENARIOS, visited, renderObstacleEditor, obstaclePlacementAllowed, moveObstacleAtPointer, point(x,y) { const p = new THREE.Vector3(worldX(x),0,worldZ(y)).project(camera); const b=renderer.domElement.getBoundingClientRect(); return {clientX:b.left+(p.x+1)*b.width/2,clientY:b.top+(1-p.y)*b.height/2}; } };`);
      res.end(bytes);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanbot-photo-test-'));
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let socket;
  try {
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await delay(100);
    if (!fs.existsSync(portFile)) throw Error('Edge did not expose DevTools');
    const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
    const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let id = 0; const pending = new Map(), errors = [];
    socket.onmessage = event => { const message = JSON.parse(event.data); if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text); if (message.id) { const promise = pending.get(message.id); pending.delete(message.id); message.error ? promise.reject(Error(message.error.message)) : promise.resolve(message.result); } };
    function command(method, params = {}) { return new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve, reject }); socket.send(JSON.stringify({ id: key, method, params })); }); }
    async function evaluate(expression) { const value = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (value.exceptionDetails) throw Error(value.exceptionDetails.text); return value.result.value; }
    await command('Runtime.enable');
    await command('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false });
    await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/` });
    for (let i = 0; i < 100; i++) { if (await evaluate(`!!document.getElementById('photoResult')?.textContent`)) break; await delay(100); }
    const output = await evaluate(`(async () => {
      document.getElementById('loginOverlay').classList.add('hidden');
      document.querySelector('.photo-audit').open = true;
      for (const [name, stainWidth] of [['Reference',0],['Before',100],['After',50]]) {
        const canvas = document.createElement('canvas'); canvas.width=400; canvas.height=400;
        const context=canvas.getContext('2d'); context.fillStyle='rgb(180,180,180)'; context.fillRect(0,0,400,400);
        context.fillStyle='rgb(60,50,40)'; context.fillRect(150,150,stainWidth,100);
        const blob=await new Promise(resolve=>canvas.toBlob(resolve));
        const transfer=new DataTransfer(); transfer.items.add(new File([blob],name+'.png',{type:'image/png'}));
        const input=document.getElementById('photo'+name); input.files=transfer.files; input.dispatchEvent(new Event('change'));
      }
      await new Promise(resolve=>setTimeout(resolve,500));
      document.getElementById('photoAligned').checked=true;
      document.getElementById('photoCompare').click();
      return {status:document.getElementById('photoResult').textContent,exportEnabled:!document.getElementById('photoExport').disabled};
    })()`);
    assert(output.status.includes('50.0%'), output.status); assert(output.exportEnabled);
    const moved = await evaluate(`(() => {
      const t=globalThis.__obstacleTest; if(!t) throw Error('Dashboard not initialized');
      t.auth.user={role:'operator'}; t.renderObstacleEditor();
      document.getElementById('obstacleEditor').open=true; document.getElementById('moveObstacles').checked=true;
      const scenario=t.SCENARIOS[t.ui.scenarioSelect.value], obstacle=scenario.obstacles[0];
      const samples=JSON.stringify(scenario.samples); t.visited.add('1,1'); t.sim.running=true;
      for(let y=1;y<15;y++) for(let x=2;x<29;x++) {
        if(!t.obstaclePlacementAllowed(obstacle,x,y)||(x===obstacle.x&&y===obstacle.y)) continue;
        document.getElementById('obstacleSelect').value='0';
        t.moveObstacleAtPointer(t.point(x+obstacle.w/2,y+obstacle.h/2));
        if(obstacle.x===x&&obstacle.y===y) return {moved:true, running:t.sim.running,coverageKept:t.visited.has('1,1'),samplesKept:JSON.stringify(scenario.samples)===samples};
      }
      return {moved:false};
    })()`);
    assert(moved.moved && moved.running && moved.coverageKept && moved.samplesKept, JSON.stringify(moved));
    const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    const screenshotPath = path.join(profile, 'photo-audit.png'); fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
    const staleCleared = await evaluate(`document.getElementById('photoThreshold').dispatchEvent(new Event('input')); document.getElementById('photoExport').disabled`);
    assert(staleCleared); assert.deepEqual(errors, []);
    await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await delay(100);
    const mobile = await evaluate(`({ width: innerWidth, contentWidth: document.documentElement.scrollWidth })`);
    assert(mobile.contentWidth <= mobile.width + 1, 'Horizontal overflow on mobile');
    console.log(JSON.stringify({ passed: true, status: output.status, screenshot: screenshotPath }));
  } finally {
    if (socket) socket.close();
    edge.kill(); server.close();
    // Keep only this run's isolated temporary profile for screenshot inspection.
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
