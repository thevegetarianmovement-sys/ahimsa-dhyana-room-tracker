const fs = require('fs');
let c = fs.readFileSync('src/app/shads/page.tsx', 'utf8');

c = c.replace(`  const shads = await prisma.shad.findMany({
    include: {
      beds: {
        include: {
          allocations: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  })`, `  const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  const res = await fetch('http://localhost:4000/api/shads', {
    headers: { Cookie: \`session=\${sessionCookie}\` },
    cache: 'no-store'
  })
  if (!res.ok) return <div>Error loading shads</div>
  const shads = await res.json()`);

fs.writeFileSync('src/app/shads/page.tsx', c);
