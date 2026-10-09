const { execSync } = require('child_process');
const fs = require('fs');

const script = `
(function() {
  const docWidth = document.documentElement.offsetWidth;
  const elements = document.querySelectorAll('*');
  const overflowing = [];
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.right > docWidth + 2) {
      overflowing.push({
        tag: el.tagName,
        id: el.id,
        class: el.className,
        right: Math.round(rect.right),
        width: Math.round(rect.width)
      });
    }
  });
  console.log('DOC_WIDTH:', docWidth);
  console.log('OVERFLOWING_COUNT:', overflowing.length);
  console.log(JSON.stringify(overflowing.slice(0, 15), null, 2));
})();
`;

// Inject into a test page
const indexHtml = fs.readFileSync('index.html', 'utf8');
const testPage = indexHtml.replace('</body>', `<script>${script}</script></body>`);
fs.writeFileSync('scratch/test_overflow.html', testPage);

const edgePath = 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe';
try {
  const out = execSync(\`"\${edgePath}" --headless --disable-gpu --window-size=375,812 "http://127.0.0.1:5500/scratch/test_overflow.html"\`, { encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.log(e.stdout || e.message);
}
