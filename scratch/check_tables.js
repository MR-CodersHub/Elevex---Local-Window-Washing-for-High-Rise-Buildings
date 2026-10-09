const fs = require('fs');
['portal-dashboard.html', 'admin-dashboard.html'].forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split('\n');
  console.log('=== ' + f + ' ===');
  lines.forEach((l, i) => {
    if (l.includes('<table') || l.includes('table-container') || l.includes('table-wrapper') || l.includes('portal-section-header')) {
      console.log(`${i+1}: ${l.trim()}`);
    }
  });
});
