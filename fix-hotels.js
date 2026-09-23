const fs = require('fs');
let c = fs.readFileSync('src/app/hotels/page.tsx', 'utf8');

const target = `  const hotels = await prisma.hotel.findMany({
    include: {
      rooms: {
        include: {
          beds: {
            include: {
              allocations: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  })`;

const replace = `  const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  
  const res = await fetch('http://localhost:4000/api/hotels', {
    headers: { Cookie: \`session=\${sessionCookie}\` },
    cache: 'no-store'
  })
  
  if (!res.ok) {
    if (res.status === 401) return <div>Unauthorized</div>
    return <div>Error loading hotels</div>
  }
  
  const hotels = await res.json()`;

c = c.replace(target, replace);
fs.writeFileSync('src/app/hotels/page.tsx', c);
