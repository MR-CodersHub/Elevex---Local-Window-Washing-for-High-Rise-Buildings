const { execSync } = require('child_process');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tabs = ['schedule', 'safety', 'reports', 'invoices', 'profile'];

for (const tab of tabs) {
  const outFile = path.join(__dirname, `portal_tab_${tab}.png`);
  const url = `http://127.0.0.1:5500/portal-dashboard.html#${tab}`;
  try {
    execSync(`"${edgePath}" --headless --disable-gpu --screenshot="${outFile}" --window-size=1920,1080 "${url}"`);
    console.log(`Captured ${tab}`);
  } catch (e) {
    console.error(`Failed ${tab}:`, e.message);
  }
}
