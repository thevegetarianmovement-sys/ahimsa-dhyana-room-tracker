const fs = require('fs');
let c = fs.readFileSync('src/app/volunteer/page.tsx', 'utf8');
c = c.replace(/import Link from 'next\/link'\n/, '');
fs.writeFileSync('src/app/volunteer/page.tsx', c);
