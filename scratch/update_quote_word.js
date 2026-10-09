const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('<span>Free Quote</span>')) {
    content = content.replace(/<span>Free Quote<\/span>/g, '<span>Quote</span>');
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Updated ${f}: <span>Free Quote</span> -> <span>Quote</span>`);
  }
});
