const { spawn } = require('child_process');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function checkHeroContent() {
  const port = 9644;
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

    const info = await sendCommand(id++, 'Runtime.evaluate', {
      expression: `(() => {
        const hero = document.querySelector('.page-hero');
        const content = document.querySelector('.page-hero-content');
        const h1 = content?.querySelector('h1');
        const p = content?.querySelector('p');
        const bg = document.querySelector('.page-hero-bg');
        const overlay = document.querySelector('.page-hero-overlay');
        return {
          hero: {
            top: hero.offsetTop,
            height: hero.offsetHeight,
            padding: getComputedStyle(hero).padding,
            minHeight: getComputedStyle(hero).minHeight
          },
          content: {
            top: content ? content.offsetTop : null,
            height: content ? content.offsetHeight : null,
            display: content ? getComputedStyle(content).display : null,
            visibility: content ? getComputedStyle(content).visibility : null,
            opacity: content ? getComputedStyle(content).opacity : null,
            color: content ? getComputedStyle(content).color : null
          },
          h1: {
            text: h1?.innerText,
            display: h1 ? getComputedStyle(h1).display : null,
            visibility: h1 ? getComputedStyle(h1).visibility : null,
            opacity: h1 ? getComputedStyle(h1).opacity : null,
            color: h1 ? getComputedStyle(h1).color : null
          },
          overlayZIndex: overlay ? getComputedStyle(overlay).zIndex : null,
          contentZIndex: content ? getComputedStyle(content).zIndex : null,
          bgZIndex: bg ? getComputedStyle(bg).zIndex : null
        };
      })()`,
      returnByValue: true
    });

    console.log('Hero details:\n', JSON.stringify(info.result.value, null, 2));

    const shot = await sendCommand(id++, 'Page.captureScreenshot', { format: 'png' });
    const fs = require('fs');
    fs.writeFileSync('scratch/services_rendered.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved scratch/services_rendered.png');

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    edge.kill();
  }
}

checkHeroContent();
