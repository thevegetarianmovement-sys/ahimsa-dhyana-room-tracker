const fs = require('fs');

let pageContent = fs.readFileSync('src/app/hotels/page.tsx', 'utf8');
if (!pageContent.includes('hotels.sort(')) {
  pageContent = pageContent.replace('const hotels = await res.json()', 'const hotels = await res.json()\nhotels.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())');
}
fs.writeFileSync('src/app/hotels/page.tsx', pageContent);

let assignContent = fs.readFileSync('src/components/volunteers/AssignShiftForm.tsx', 'utf8');
assignContent = assignContent.replace('hotels.map(h =>', 
  '[...hotels].sort((a: any,b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((h: any) =>'
);
assignContent = assignContent.replace('{h.name}</option>', '{h.name} {new Date(h.createdAt) > new Date("2026-09-28") ? "⭐ (Ready)" : ""}</option>');
fs.writeFileSync('src/components/volunteers/AssignShiftForm.tsx', assignContent);
