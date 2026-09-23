const fs = require('fs');
let c = fs.readFileSync('src/app/participants/page.tsx', 'utf8');

const oldCode = `  let whereClause: any = {}
  if (q) {
    whereClause.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { registrationNumber: { contains: q } },
      { allocations: { some: { accommodationId: { contains: q } } } }
    ]
  }

  if (status === 'UNASSIGNED') {
    whereClause.allocations = { none: {} }
  } else if (status === 'ACTIVE' || status === 'CHECKED_OUT') {
    whereClause.allocations = { some: { status: status } }
  }

  let participants = await prisma.participant.findMany({
    where: whereClause,
    include: {
      category: true,
      allocations: {
        include: {
          bed: { include: { room: { include: { hotel: true } } } },
          shadBed: { include: { shad: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })`;

const newCode = `  const sessionCookie = cookies().get('session')?.value || ''

  const res = await fetch(\`http://localhost:4000/api/participants?q=\${encodeURIComponent(q)}&status=\${encodeURIComponent(status)}\`, {
    headers: { Cookie: \`session=\${sessionCookie}\` },
    cache: 'no-store'
  })
  
  if (!res.ok) {
    if (res.status === 401) redirect('/login')
    return <div className="p-8 text-center text-red-600">Backend Error</div>
  }

  let participants = await res.json()`;

c = c.replace(oldCode, newCode);
fs.writeFileSync('src/app/participants/page.tsx', c);
