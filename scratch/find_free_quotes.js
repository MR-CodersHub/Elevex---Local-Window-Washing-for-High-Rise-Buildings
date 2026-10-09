const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const count = (content.match(/<span>Free Quote<\/span>/g) || []).length;
  if (count > 0) {
    console.log(`${f}: ${count} instance(s) of <span>Free Quote</span>`);
  }
});
