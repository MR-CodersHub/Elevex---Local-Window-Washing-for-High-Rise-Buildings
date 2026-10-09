const { spawn } = require('child_process');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function diagnose() {
  const port = 9656;
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
    await new Promise(r => setTimeout(r, 1500));

    const analysis = await sendCommand(id++, 'Runtime.evaluate', {
      expression: `(() => {
        const toObj = (r) => r ? ({ top: r.top, bottom: r.bottom, height: r.height, y: r.y }) : null;
        const hero = document.querySelector('.page-hero');
        const allSection = document.querySelector('#allServicesGridSection');
        const grid = document.querySelector('.service-module-grid');
        const cards = Array.from(document.querySelectorAll('.service-module-card'));
        const nextSection = document.querySelector('#serviceEstimatorSection') || allSection?.nextElementSibling;
        
        return {
          windowScrollY: window.scrollY,
          heroRect: toObj(hero?.getBoundingClientRect()),
          allSectionRect: toObj(allSection?.getBoundingClientRect()),
          gridRect: toObj(grid?.getBoundingClientRect()),
          card0Rect: toObj(cards[0]?.getBoundingClientRect()),
          card2Rect: toObj(cards[2]?.getBoundingClientRect()),
          card3Rect: toObj(cards[3]?.getBoundingClientRect()),
          card5Rect: toObj(cards[5]?.getBoundingClientRect()),
          card6Rect: toObj(cards[6]?.getBoundingClientRect()),
          card7Rect: toObj(cards[7]?.getBoundingClientRect()),
          nextSectionRect: toObj(nextSection?.getBoundingClientRect()),
          nextSectionTag: nextSection?.tagName + '#' + nextSection?.id
        };
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(analysis.result.value, null, 2));

    ws.close();
  } catch(e) {
    console.error(e);
  } finally {
    edge.kill();
  }
}

diagnose();
