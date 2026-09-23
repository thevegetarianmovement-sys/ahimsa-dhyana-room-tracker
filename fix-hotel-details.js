const fs = require('fs');
let c = fs.readFileSync('src/app/hotels/[id]/page.tsx', 'utf8');

const target = `  const hotel = await prisma.hotel.findUnique({
    where: { id: params.id },
    include: {
      rooms: {
        include: {
          beds: {
            include: {
              allocations: {
                where: { status: 'ACTIVE' },
                include: { participant: true }
              }
            }
          }
        },
        orderBy: { number: 'asc' }
      },
      volunteerShifts: { include: { volunteer: true } }
    }
  })`;

const replace = `  const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  const res = await fetch(\`http://localhost:4000/api/hotels/\${params.id}\`, {
    headers: { Cookie: \`session=\${sessionCookie}\` },
    cache: 'no-store'
  })
  
  if (!res.ok) {
    notFound()
  }
  const hotel = await res.json()`;

c = c.replace(target, replace);
fs.writeFileSync('src/app/hotels/[id]/page.tsx', c);
