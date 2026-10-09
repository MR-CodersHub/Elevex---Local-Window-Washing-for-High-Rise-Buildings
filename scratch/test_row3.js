const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testRow3() {
  const port = 9658;
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
    await sendCommand(id++, 'Emulation.setDeviceMetricsOverride', { width: 1920, height: 960, deviceScaleFactor: 1, mobile: false });
    await sendCommand(id++, 'Page.enable');
    await sendCommand(id++, 'Page.navigate', { url: 'http://127.0.0.1:5500/services.html' });
    await new Promise(r => setTimeout(r, 1500));

    await sendCommand(id++, 'Runtime.evaluate', {
      expression: `document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('elevex_theme', 'dark');`
    });
    await new Promise(r => setTimeout(r, 300));

    for (const sy of [2400, 2600, 2800, 3100]) {
      await sendCommand(id++, 'Runtime.evaluate', { expression: `window.scrollTo(0, ${sy});` });
      await new Promise(r => setTimeout(r, 300));
      const shot = await sendCommand(id++, 'Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(__dirname, `dark_scroll_${sy}.png`), Buffer.from(shot.data, 'base64'));
      console.log(`Saved dark_scroll_${sy}.png`);
    }

    ws.close();
  } catch(e) {
    console.error(e);
  } finally {
    edge.kill();
  }
}

testRow3();
