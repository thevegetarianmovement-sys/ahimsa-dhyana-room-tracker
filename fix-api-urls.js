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

const files = walk('src/components').concat(walk('src/app'));

let changed = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace client-side fetches with relative URLs to use the Next.js rewrite proxy.
  content = content.replace(/\`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/127\.0\.0\.1:4000'\}\/api/g, '`/api');
  // Handle some places where it might not have the fallback
  content = content.replace(/\`\$\{process\.env\.NEXT_PUBLIC_API_URL\}\/api/g, '`/api');

  if (content !== original) {
    fs.writeFileSync(f, content);
    changed++;
    console.log('Updated', f);
  }
});

console.log('Total files changed:', changed);
