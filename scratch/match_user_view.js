const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testScreenshots() {
  const port = 9677;
  const edge = spawn(edgePath, ['--headless', '--disable-gpu', `--remote-debugging-port=${port}`, 'about:blank']);
  await new Promise(r => setTimeout(r, 1200));

  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await listRes.json();
    const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise(r => ws.addEventListener('open', r, { once: true }));

    function sendCommand(id, method, params = {}) {
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

    let id = 1;
    await sendCommand(id++, 'Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
    await sendCommand(id++, 'Page.enable');
    await sendCommand(id++, 'Page.navigate', { url: 'http://127.0.0.1:5500/services.html' });
    await new Promise(r => setTimeout(r, 2000));

    // Also check console errors!
    await sendCommand(id++, 'Runtime.enable');

    // Find out if any section matches the user's screenshot!
    // Take screenshots at 0, 400, 600, 800, 1000
    for (const sy of [0, 400, 700, 1000, 1500]) {
      await sendCommand(id++, 'Runtime.evaluate', { expression: `window.scrollTo(0, ${sy});` });
      await new Promise(r => setTimeout(r, 500));
      const shot = await sendCommand(id++, 'Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(__dirname, `user_match_${sy}.png`), Buffer.from(shot.data, 'base64'));
      console.log(`Captured user_match_${sy}.png`);
    }

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    edge.kill();
  }
}

testScreenshots();
