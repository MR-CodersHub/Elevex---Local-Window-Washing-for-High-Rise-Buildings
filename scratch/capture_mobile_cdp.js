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

async function captureMobile(url, outputFile, scrollY = 0) {
  const port = 9333 + Math.floor(Math.random() * 100);
  const edge = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await listRes.json();
    const wsUrl = targets[0]?.webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);
    await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

    let id = 1;
    // Set 360x645 mobile emulation
    await sendCommand(ws, id++, 'Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 645,
      deviceScaleFactor: 1,
      mobile: true
    });

    // Navigate to page
    await sendCommand(ws, id++, 'Page.enable');
    await sendCommand(ws, id++, 'Page.navigate', { url });
    await new Promise(r => setTimeout(r, 1500));

    if (scrollY > 0) {
      await sendCommand(ws, id++, 'Runtime.evaluate', {
        expression: `window.scrollTo(0, ${scrollY});`
      });
      await new Promise(r => setTimeout(r, 400));
    }

    // Capture screenshot
    const shot = await sendCommand(ws, id++, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outputFile, Buffer.from(shot.data, 'base64'));
    console.log(`Successfully captured 360px: ${outputFile}`);

    ws.close();
  } catch (e) {
    console.error(`Error capturing ${url}:`, e.message);
  } finally {
    edge.kill();
  }
}

async function run() {
  await captureMobile('http://127.0.0.1:5500/portal-dashboard.html', path.join(__dirname, 'cdp_portal_top.png'), 0);
  await captureMobile('http://127.0.0.1:5500/portal-dashboard.html', path.join(__dirname, 'cdp_portal_cards.png'), 480);
  await captureMobile('http://127.0.0.1:5500/admin-dashboard.html', path.join(__dirname, 'cdp_admin_top.png'), 0);
  console.log('All CDP captures completed!');
}

run();
