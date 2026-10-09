const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const portalHtml = fs.readFileSync(path.join(__dirname, '..', 'portal-dashboard.html'), 'utf8');

// Inject open class directly on scheduleModal
const testHtml = portalHtml
  .replaceAll('href="css/', 'href="/css/')
  .replaceAll('src="js/', 'src="/js/')
  .replace('class="portal-modal-backdrop" id="scheduleModal"', 'class="portal-modal-backdrop open" id="scheduleModal"');

fs.writeFileSync(path.join(__dirname, 'test-modal.html'), testHtml);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const shot = path.join(__dirname, 'portal_schedule_modal.png');

try {
  execSync(`"${edgePath}" --headless --disable-gpu --screenshot="${shot}" --window-size=1920,1080 "http://127.0.0.1:5500/scratch/test-modal.html"`);
  console.log('Modal screenshot captured');
} catch (e) {
  console.error(e);
}
