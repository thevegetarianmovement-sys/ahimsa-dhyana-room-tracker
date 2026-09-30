const fs = require('fs');

function updateAdminHotels(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Insert capacity counting logic
  content = content.replace(
    /let hTotalBeds = 0\s*let hOccupied = 0\s*hotel\.rooms\.forEach\(\(r: any\) => \{/g,
    `let hTotalBeds = 0
            let hOccupied = 0
            const capacityCounts: Record<number, number> = {}
            hotel.rooms.forEach((r: any) => {
              const cap = r.beds.length
              capacityCounts[cap] = (capacityCounts[cap] || 0) + 1`
  );

  // Insert the rendering logic inside the card
  content = content.replace(
    /<p className="text-sm text-slate-500 mb-4">\{hotel\.location\}<\/p>/g,
    `<p className="text-sm text-slate-500 mb-2">{hotel.location}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {Object.entries(capacityCounts)
                      .sort(([capA], [capB]) => Number(capA) - Number(capB))
                      .map(([cap, count]) => (
                        <span key={cap} className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                          {count} - {cap} beds
                        </span>
                      ))}
                  </div>`
  );

  fs.writeFileSync(path, content);
}

function updateVolunteerHotels(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Add the capacity logic right before returning the link
  content = content.replace(
    /<Link href=\{\`\/volunteer\/hotels\/\$\{hotel\.id\}\`\} key=\{hotel\.id\}/g,
    `{(() => {
                const capacityCounts: Record<number, number> = {}
                hotel.rooms?.forEach((r: any) => {
                  const cap = r.beds?.length || 0
                  capacityCounts[cap] = (capacityCounts[cap] || 0) + 1
                })
                
                return (
                  <Link href={\`/volunteer/hotels/\${hotel.id}\`} key={hotel.id}`
  );

  // Add the rendering logic inside the card
  content = content.replace(
    /<p className="text-sm text-slate-500">\{hotel\.location\}<\/p>\s*<\/Link>/g,
    `<p className="text-sm text-slate-500 mb-2">{hotel.location}</p>
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
            )})()}`
  );

  fs.writeFileSync(path, content);
}

updateAdminHotels('src/app/hotels/page.tsx');
updateVolunteerHotels('src/app/volunteer/hotels/page.tsx');
console.log('Added room capacity breakdowns to hotel cards');
