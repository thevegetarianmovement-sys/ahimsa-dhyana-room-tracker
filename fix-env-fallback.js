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
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
let replacedCount = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('${process.env.NEXT_PUBLIC_API_URL}')) {
    // Add fallback so we don't get undefined/api/... if the env var isn't loaded
    content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g, "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}");
    fs.writeFileSync(f, content);
    replacedCount++;
  }
});

console.log(`Added fallback to ${replacedCount} files.`);
