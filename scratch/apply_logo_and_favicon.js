const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const htmlFiles = [
  'about.html',
  'admin-dashboard.html',
  'blog-detail-1.html',
  'blog-detail-2.html',
  'blog-detail-3.html',
  'blog-detail-4.html',
  'blog-detail-5.html',
  'blog-detail-6.html',
  'blog-detail-7.html',
  'blog-detail.html',
  'blog.html',
  'contact.html',
  'home-2.html',
  'index.html',
  'login.html',
  'portal-dashboard.html',
  'safety.html',
  'services.html'
];

const newLogoSvg = `<svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="elxPink" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#d9043d"/>
                <stop offset="50%" stop-color="#ff1e56"/>
                <stop offset="100%" stop-color="#ff577d"/>
              </linearGradient>
              <linearGradient id="elxCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#38bdf8"/>
                <stop offset="100%" stop-color="#0284c7"/>
              </linearGradient>
            </defs>
            <path d="M5 26V13.5L11 9.5V26H5Z" fill="#15213b" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M11 26V7.5L16 3.5L21 7.5V26H11Z" fill="url(#elxPink)"/>
            <path d="M21 26V9.5L27 13.5V26H21Z" fill="#15213b" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.2" stroke-linejoin="round"/>
            <line x1="16" y1="5.5" x2="16" y2="25" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M7 21L16 13L25 21" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.5 24.5L16 18.5L22.5 24.5" stroke="url(#elxCyan)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;

const faviconTag = '<link rel="icon" type="image/svg+xml" href="favicon.svg">';

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping missing file: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Favicon replacement
  const faviconRegex = /<link\s+rel=["']icon["'][^>]*>/i;
  if (faviconRegex.test(content)) {
    content = content.replace(faviconRegex, faviconTag);
  } else {
    // Insert before </head>
    content = content.replace(/<\/head>/i, `  ${faviconTag}\n</head>`);
  }

  // 2. Logo replacement in .logo-icon and .portal-brand-logo
  // Matches <div class="logo-icon"...> or <div class="portal-brand-logo"...>
  // and replaces the old building svg inside it
  const logoWrapperRegex = /(<div class="(?:portal-brand-logo|logo-icon)"[^>]*>)([\s\S]*?)(<\/div>)/g;
  content = content.replace(logoWrapperRegex, (match, openTag, innerContent, closeTag) => {
    // Only replace if it contains the old building path
    if (innerContent.includes('M3 21h18M5 21V7l8-4v18M13 21V3l6 4v14')) {
      return `${openTag}\n          ${newLogoSvg}\n        ${closeTag}`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated logo & favicon in: ${file}`);
  } else {
    console.log(`No changes needed in: ${file}`);
  }
});

console.log('Finished logo and favicon updates across all files.');
