const fs = require('fs');
const path = 'src/app/volunteer/hotels/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `<div className="space-y-4">
          {hotels.map((hotel: any) => {
            const capacityCounts: Record<number, number> = {}
            hotel.rooms?.forEach((r: any) => {
              const cap = r.beds?.length || 0
              capacityCounts[cap] = (capacityCounts[cap] || 0) + 1
            })

            return (
              <Link href={\`/volunteer/hotels/\${hotel.id}\`} key={hotel.id} className="block bg-white p-4 rounded-xl shadow-sm border hover:border-blue-500">
                <h2 className="text-xl font-bold">{hotel.name}</h2>
                <p className="text-sm text-slate-500 mb-2">{hotel.location}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(capacityCounts)
                    .sort(([capA], [capB]) => Number(capA) - Number(capB))
                    .map(([cap, count]) => (
                      <span key={cap} className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                        {count} - {cap} beds
                      </span>
                    ))}
                </div>
              </Link>
            )
          })}
          {hotels.length`;

content = content.replace(/<div className="space-y-4">[\s\S]*?\{hotels\.length/g, replacement);

fs.writeFileSync(path, content);
console.log('Brute forced the fix');
