const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const cleanBlock = `<div class="account-dropdown-wrapper">
            <button class="btn-account-toggle js-account-toggle" id="accountDropdownBtn" aria-label="User Account Menu" aria-haspopup="true" title="Account & Portals">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div class="account-dropdown-menu" id="accountMenuDropdown">
              <a href="#login" class="dropdown-item js-open-auth" id="accountLoginLink">
                <div class="dropdown-item-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                  <span>Login / Sign Up</span>
                </div>
              </a>

              <a href="admin-dashboard.html" class="dropdown-item" id="accountAdminLink">
                <div class="dropdown-item-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>Admin Dashboard</span>
                </div>
              </a>

              <a href="portal-dashboard.html" class="dropdown-item featured" id="accountPortalLink">
                <div class="dropdown-item-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 4v14" />
                  </svg>
                  <span>Building Manager Dashboard</span>
                </div>
                <span class="dropdown-item-badge">Portal</span>
              </a>
            </div>
          </div>`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace anything starting from <div class="account-dropdown-wrapper"> down to the line before <button class="mobile-nav-toggle"
  const startIdx = content.indexOf('<div class="account-dropdown-wrapper">');
  const endIdx = content.indexOf('<button class="mobile-nav-toggle"');
  
  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx);
    content = before + cleanBlock + '\n\n          ' + after;
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Cleaned ${f}`);
  } else {
    console.log(`Could not find markers in ${f}`);
  }
});
