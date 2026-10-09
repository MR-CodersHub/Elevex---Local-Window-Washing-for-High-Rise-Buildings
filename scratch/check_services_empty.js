const { spawn } = require('child_process');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function checkServicesPage() {
  const port = 9633;
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
    await sendCommand(id++, 'Page.enable');
    await sendCommand(id++, 'Page.navigate', { url: 'http://127.0.0.1:5500/services.html' });
    await new Promise(r => setTimeout(r, 1500));

    const info = await sendCommand(id++, 'Runtime.evaluate', {
      expression: `(() => {
        const hero = document.querySelector('.page-hero');
        const header = document.querySelector('.site-header');
        const mainSection = document.querySelector('#allServicesGridSection');
        const body = document.body;
        return {
          headerHeight: header?.offsetHeight,
          headerComputed: header ? {
            position: getComputedStyle(header).position,
            height: getComputedStyle(header).height,
            marginBottom: getComputedStyle(header).marginBottom
          } : null,
          heroExists: Boolean(hero),
          heroComputed: hero ? {
            display: getComputedStyle(hero).display,
            visibility: getComputedStyle(hero).visibility,
            opacity: getComputedStyle(hero).opacity,
            height: getComputedStyle(hero).height,
            minHeight: getComputedStyle(hero).minHeight,
            paddingTop: getComputedStyle(hero).paddingTop,
            paddingBottom: getComputedStyle(hero).paddingBottom,
            marginTop: getComputedStyle(hero).marginTop,
            background: getComputedStyle(hero).background
          } : null,
          heroRect: hero ? hero.getBoundingClientRect() : null,
          mainSectionRect: mainSection ? mainSection.getBoundingClientRect() : null,
          bodyScrollHeight: body.scrollHeight,
          windowInnerHeight: window.innerHeight,
          scrollY: window.scrollY
        };
      })()`,
      returnByValue: true
    });

    console.log('Services page info:\n', JSON.stringify(info.result.value, null, 2));

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    edge.kill();
  }
}

checkServicesPage();
