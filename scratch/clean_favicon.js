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

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace any malformed favicon tag like <link rel="icon"...><path...></svg>">
  content = content.replace(/<link\s+rel=["']icon["'][^>]*>(?:<path[^>]*><\/svg>">)?/gi, '<link rel="icon" type="image/svg+xml" href="favicon.svg">');

  // Also replace any standalone leftover <path d='M12 2L2 22h20L12 2zm0 4.5l6.5 13H5.5L12 6.5z'/></svg>">
  content = content.replace(/<path d='M12 2L2 22h20L12 2zm0 4.5l6.5 13H5.5L12 6.5z'\/><\/svg>">\s*/gi, '');

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Cleaned favicon tags in all HTML files.');
