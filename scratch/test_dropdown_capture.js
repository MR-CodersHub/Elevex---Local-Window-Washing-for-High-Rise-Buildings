const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Fix relative paths and set dropdown open
const testHtml = indexHtml
  .replace('href="css/style.css"', 'href="/css/style.css"')
  .replace('src="js/', 'src="/js/')
  .replace('class="account-dropdown-menu"', 'class="account-dropdown-menu show"')
  .replace('class="btn-account-toggle js-account-toggle"', 'class="btn-account-toggle js-account-toggle active"');

fs.writeFileSync(path.join(__dirname, 'test-dropdown.html'), testHtml);

// Capture desktop screenshot
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const desktopShot = path.join(__dirname, 'dropdown_desktop.png');
const mobileShot = path.join(__dirname, 'dropdown_mobile.png');

try {
  execSync(`"${edgePath}" --headless --disable-gpu --screenshot="${desktopShot}" --window-size=1920,1080 "http://127.0.0.1:5500/scratch/test-dropdown.html"`, { stdio: 'inherit' });
  console.log('Desktop dropdown screenshot captured.');
} catch (e) {
  console.error(e);
}

try {
  execSync(`"${edgePath}" --headless --disable-gpu --screenshot="${mobileShot}" --window-size=375,812 "http://127.0.0.1:5500/scratch/test-dropdown.html"`, { stdio: 'inherit' });
  console.log('Mobile dropdown screenshot captured.');
} catch (e) {
  console.error(e);
}
