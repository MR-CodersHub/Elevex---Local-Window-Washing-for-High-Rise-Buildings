const http = require('http');
const fs = require('fs');
const { execSync } = require('child_process');

// Tiny listener to receive log from browser
const logServer = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      fs.writeFileSync('scratch/overflow_report.json', body);
      res.writeHead(200);
      res.end('OK');
      logServer.close();
      process.exit(0);
    });
  }
});

logServer.listen(5501, () => {
  // Create test page that sends overflow elements to port 5501
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  const injectScript = `
  <script>
  window.addEventListener('load', () => {
    setTimeout(() => {
      const docWidth = document.documentElement.offsetWidth;
      const elements = Array.from(document.querySelectorAll('*'));
      const overflowing = [];
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 2) {
          overflowing.push({
            tag: el.tagName,
            id: el.id,
            className: typeof el.className === 'string' ? el.className : '',
            right: Math.round(rect.right),
            width: Math.round(rect.width)
          });
        }
      });
      fetch('http://127.0.0.1:5501', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docWidth, count: overflowing.length, items: overflowing.slice(0, 20) })
      });
    }, 500);
  });
  </script>
  `;
  fs.writeFileSync('scratch/test_overflow.html', indexHtml.replace('</body>', injectScript + '</body>'));

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  execSync(`"${edgePath}" --headless --disable-gpu --window-size=375,812 "http://127.0.0.1:5500/scratch/test_overflow.html"`);
});
