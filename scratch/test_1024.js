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

async function capture1024() {
  const port = 9599;
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
    const pageTarget = targets.find(t => t.type === 'page');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

    let id = 1;
    await sendCommand(ws, id++, 'Runtime.enable');
    await sendCommand(ws, id++, 'Page.enable');

    // 1024x768
    await sendCommand(ws, id++, 'Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false
    });

    await sendCommand(ws, id++, 'Page.navigate', { url: 'http://127.0.0.1:5500/index.html' });
    await new Promise(r => setTimeout(r, 1500));

    const shot = await sendCommand(ws, id++, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, 'check_1024_navbar.png'), Buffer.from(shot.data, 'base64'));
    console.log('Saved check_1024_navbar.png');

    // Also check nav container metrics
    const metrics = await sendCommand(ws, id++, 'Runtime.evaluate', {
      expression: `(() => {
        const nav = document.querySelector('.main-nav');
        const navLinks = document.querySelector('.nav-links');
        const navActions = document.querySelector('.nav-actions');
        const header = document.querySelector('.site-header');
        return {
          navWidth: nav?.offsetWidth,
          navScrollWidth: nav?.scrollWidth,
          navLinksWidth: navLinks?.offsetWidth,
          navActionsWidth: navActions?.offsetWidth,
          headerHeight: header?.offsetHeight,
          windowWidth: window.innerWidth,
          navLinksVisible: getComputedStyle(navLinks).display,
          mobileToggleVisible: getComputedStyle(document.querySelector('.mobile-nav-toggle')).display
        };
      })()`,
      returnByValue: true
    });
    console.log('Metrics at 1024px:', metrics.result.value);

    // Also check portal-dashboard at 1024px
    await sendCommand(ws, id++, 'Page.navigate', { url: 'http://127.0.0.1:5500/portal-dashboard.html' });
    await new Promise(r => setTimeout(r, 1500));

    const shotPortal = await sendCommand(ws, id++, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, 'check_1024_portal.png'), Buffer.from(shotPortal.data, 'base64'));
    console.log('Saved check_1024_portal.png');

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    edge.kill();
  }
}

capture1024();
