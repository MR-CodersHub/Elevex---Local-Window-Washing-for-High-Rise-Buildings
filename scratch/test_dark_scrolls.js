const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testDarkScreens() {
  const port = 9657;
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
    // User screen resolution from screenshot: Windows taskbar at bottom, 1920x1080 approx, viewport ~ 1920x960
    await sendCommand(id++, 'Emulation.setDeviceMetricsOverride', { width: 1920, height: 960, deviceScaleFactor: 1, mobile: false });
    await sendCommand(id++, 'Page.enable');
    await sendCommand(id++, 'Page.navigate', { url: 'http://127.0.0.1:5500/services.html' });
    await new Promise(r => setTimeout(r, 1500));

    // Enable dark theme
    await sendCommand(id++, 'Runtime.evaluate', {
      expression: `document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('elevex_theme', 'dark');`
    });
    await new Promise(r => setTimeout(r, 500));

    // Check multiple scroll positions:
    // hero is 580px + header 116px = 696px.
    // What if scrolled to 450px? 550px? 650px? 2500px?
    const scrollPositions = [0, 450, 600, 750, 1000, 2200, 2600, 3000];
    for (const sy of scrollPositions) {
      await sendCommand(id++, 'Runtime.evaluate', { expression: `window.scrollTo(0, ${sy});` });
      await new Promise(r => setTimeout(r, 400));
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

testDarkScreens();
