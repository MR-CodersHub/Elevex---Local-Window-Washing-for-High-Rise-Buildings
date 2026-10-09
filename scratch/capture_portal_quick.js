const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function sendCommand(ws, id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener('message', handler);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function capture() {
  const port = 9611;
  const edge = spawn(edgePath, ['--headless', '--disable-gpu', `--remote-debugging-port=${port}`, 'about:blank']);
  await new Promise(r => setTimeout(r, 1200));

  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await listRes.json();
    const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise(r => ws.addEventListener('open', r, { once: true }));

    let id = 1;
    await sendCommand(ws, id++, 'Emulation.setDeviceMetricsOverride', { width: 1024, height: 1000, deviceScaleFactor: 1, mobile: false });
    await sendCommand(ws, id++, 'Page.enable');
    await sendCommand(ws, id++, 'Page.navigate', { url: 'http://127.0.0.1:5500/portal-dashboard.html' });
    await new Promise(r => setTimeout(r, 1500));

    // Scroll slightly to show Quick commands
    await sendCommand(ws, id++, 'Runtime.evaluate', { expression: `window.scrollTo(0, 300);` });
    await new Promise(r => setTimeout(r, 400));

    const shot = await sendCommand(ws, id++, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, 'check_portal_quick_1024.png'), Buffer.from(shot.data, 'base64'));
    console.log('Saved check_portal_quick_1024.png');

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    edge.kill();
  }
}
capture();
