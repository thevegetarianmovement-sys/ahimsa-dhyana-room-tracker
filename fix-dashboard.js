const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

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
    }
  })

  const shads = await prisma.shad.findMany({
    include: {
      beds: {
        include: {
          allocations: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
  })`;

const replace = `  const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  
  const [hotelsRes, shadsRes] = await Promise.all([
    fetch('http://localhost:4000/api/hotels', { headers: { Cookie: \`session=\${sessionCookie}\` }, cache: 'no-store' }),
    fetch('http://localhost:4000/api/shads', { headers: { Cookie: \`session=\${sessionCookie}\` }, cache: 'no-store' })
  ])

  const hotels = await hotelsRes.json()
  const shads = await shadsRes.json()`;

c = c.replace(target, replace);
fs.writeFileSync('src/app/dashboard/page.tsx', c);
