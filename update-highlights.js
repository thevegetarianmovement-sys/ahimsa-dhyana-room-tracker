const fs = require('fs');

const readyHotelsList = `const readyHotels = [
  "MARJAN INTERNATIONAL", "GOPI RESIDENCY", "THREE CASTLE", "SRI SAI RESIDENCY",
  "HOTEL AADAAB", "NEW STAR LODGE", "BLUE STAR LODGE", "WEST INN",
  "SAI KIRAN LODGE", "HOTEL SAI PRAKASH", "HOTEL AAHWAANAM", "HOTEL TULASI"
];
const isReady = (name) => readyHotels.some(r => name.toUpperCase().includes(r.toUpperCase()));`

let pageContent = fs.readFileSync('src/app/hotels/page.tsx', 'utf8');
if (!pageContent.includes('const readyHotels =')) {
  pageContent = pageContent.replace('export default async function HotelsPage() {', 'export default async function HotelsPage() {\n' + readyHotelsList);
}
pageContent = pageContent.replace('new Date(hotel.createdAt) > new Date("2026-09-28")', 'isReady(hotel.name)');
// also change the sort logic to sort by isReady first, then by createdAt!
pageContent = pageContent.replace('hotels.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())', 'hotels.sort((a: any, b: any) => {\n    const aReady = isReady(a.name) ? 1 : 0;\n    const bReady = isReady(b.name) ? 1 : 0;\n    if (bReady !== aReady) return bReady - aReady;\n    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();\n  })');

fs.writeFileSync('src/app/hotels/page.tsx', pageContent);

let assignContent = fs.readFileSync('src/components/volunteers/AssignShiftForm.tsx', 'utf8');
if (!assignContent.includes('const readyHotels =')) {
  assignContent = assignContent.replace('export default function AssignShiftForm', readyHotelsList + '\nexport default function AssignShiftForm');
}
assignContent = assignContent.replace('new Date(h.createdAt) > new Date("2026-09-28")', 'isReady(h.name)');
assignContent = assignContent.replace('[...hotels].sort((a: any,b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())', 
  '[...hotels].sort((a: any,b: any) => {\n    const aReady = isReady(a.name) ? 1 : 0;\n    const bReady = isReady(b.name) ? 1 : 0;\n    if (bReady !== aReady) return bReady - aReady;\n    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();\n  })'
);
fs.writeFileSync('src/components/volunteers/AssignShiftForm.tsx', assignContent);
