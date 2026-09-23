const fs = require('fs');
let h = fs.readFileSync('src/app/reports/hotels/page.tsx', 'utf8');
h = h.replace(/hotels\.map\(hotel =>/g, 'hotels.map((hotel: any) =>');
fs.writeFileSync('src/app/reports/hotels/page.tsx', h);

let s = fs.readFileSync('src/app/reports/shads/page.tsx', 'utf8');
s = s.replace(/shads\.map\(shad =>/g, 'shads.map((shad: any) =>');
fs.writeFileSync('src/app/reports/shads/page.tsx', s);
