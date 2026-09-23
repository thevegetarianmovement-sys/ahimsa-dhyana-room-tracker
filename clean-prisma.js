const fs = require('fs');
const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    if (fs.statSync(file).isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
  });
  return results;
};
const files = walk('src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('import prisma from') && !content.match(/prisma\.[a-zA-Z]/)) {
    content = content.replace(/import prisma from ['"]@\/lib\/db['"]\r?\n/g, '');
    fs.writeFileSync(f, content);
    console.log('Removed unused prisma import from', f);
  }
});
