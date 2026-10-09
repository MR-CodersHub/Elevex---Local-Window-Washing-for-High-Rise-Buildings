const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function scanPage() {
  const port = 9655;
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
    await sendCommand(id++, 'Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await sendCommand(id++, 'Page.enable');
    await sendCommand(id++, 'Page.navigate', { url: 'http://127.0.0.1:5500/services.html' });
    await new Promise(r => setTimeout(r, 1500));

    // Get all sections and their rects, heights, backgrounds, margins, paddings
    const sections = await sendCommand(id++, 'Runtime.evaluate', {
      expression: `(() => {
        const allSections = [...document.querySelectorAll('section, header, footer, div[class*="section"]')];
        return allSections.map(s => {
          const rect = s.getBoundingClientRect();
          const comp = getComputedStyle(s);
          return {
            tag: s.tagName,
            id: s.id,
            className: s.className,
            offsetTop: s.offsetTop,
            offsetHeight: s.offsetHeight,
            paddingTop: comp.paddingTop,
            paddingBottom: comp.paddingBottom,
            marginTop: comp.marginTop,
            marginBottom: comp.marginBottom,
            background: comp.backgroundColor,
            color: comp.color,
            display: comp.display
          };
        });
      })()`,
      returnByValue: true
    });

    console.log('Sections:\n', JSON.stringify(sections.result.value, null, 2));

    // Check if any element has massive margin/padding or min-height
    const bigSpacers = await sendCommand(id++, 'Runtime.evaluate', {
      expression: `(() => {
        const els = [...document.querySelectorAll('*')];
        const res = [];
        for (const el of els) {
          const comp = getComputedStyle(el);
          const pt = parseFloat(comp.paddingTop) || 0;
          const pb = parseFloat(comp.paddingBottom) || 0;
          const mt = parseFloat(comp.marginTop) || 0;
          const mb = parseFloat(comp.marginBottom) || 0;
          const h = el.offsetHeight;
          if (pt > 120 || pb > 120 || mt > 100 || mb > 100 || (h > 600 && el.innerText.trim().length < 50)) {
            res.push({
              tag: el.tagName,
              id: el.id,
              className: el.className,
              pt, pb, mt, mb, h,
              textLength: el.innerText.trim().length
            });
          }
        }
        return res;
      })()`,
      returnByValue: true
    });

    console.log('Big spacers:\n', JSON.stringify(bigSpacers.result.value, null, 2));

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    edge.kill();
  }
}

scanPage();
