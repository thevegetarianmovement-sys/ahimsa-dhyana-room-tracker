const fs = require('fs');
let c = fs.readFileSync('src/app/shads/[id]/page.tsx', 'utf8');

c = c.replace(`  const shad = await prisma.shad.findUnique({
    where: { id: params.id },
    include: {
      beds: {
        include: {
          allocations: {
            where: { status: 'ACTIVE' },
            include: { participant: true }
          }
        },
        orderBy: { number: 'asc' }
      }
    }
  })`, `  const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  const res = await fetch(\`http://localhost:4000/api/shads/\${params.id}\`, {
    headers: { Cookie: \`session=\${sessionCookie}\` },
    cache: 'no-store'
  })
  if (!res.ok) notFound()
  const shad = await res.json()`);

fs.writeFileSync('src/app/shads/[id]/page.tsx', c);
