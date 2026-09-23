const fs = require('fs');
let content = fs.readFileSync('src/app/participants/page.tsx', 'utf8');
content = content.replace(/hotels\.map\(h =>/g, 'hotels.map((h: any) =>');
content = content.replace(/shads\.map\(s =>/g, 'shads.map((s: any) =>');
fs.writeFileSync('src/app/participants/page.tsx', content);
