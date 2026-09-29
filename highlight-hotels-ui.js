const fs = require('fs');

let pageContent = fs.readFileSync('src/app/hotels/page.tsx', 'utf8');

if (!pageContent.includes('⭐ (Ready)')) {
  pageContent = pageContent.replace(
    '<h3 className="text-xl font-bold mb-2">{hotel.name}</h3>',
    '<h3 className="text-xl font-bold mb-2">\n                    {hotel.name}\n                    {new Date(hotel.createdAt) > new Date("2026-09-28") && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full align-middle border border-green-200 shadow-sm">⭐ Ready</span>}\n                  </h3>'
  );
  fs.writeFileSync('src/app/hotels/page.tsx', pageContent);
}
