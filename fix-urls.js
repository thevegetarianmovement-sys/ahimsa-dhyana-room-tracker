const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
let replacedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:4000')) {
    // Single quotes 'http://localhost:4000...' -> `${process.env.NEXT_PUBLIC_API_URL}...`
    content = content.replace(/'http:\/\/localhost:4000([^']+)'/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
    // Double quotes
    content = content.replace(/"http:\/\/localhost:4000([^"]+)"/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
    // Backticks
    content = content.replace(/`http:\/\/localhost:4000([^`]+)`/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
    
    fs.writeFileSync(file, content);
    replacedFiles++;
    console.log('Updated', file);
  }
});
console.log('Total files updated:', replacedFiles);
