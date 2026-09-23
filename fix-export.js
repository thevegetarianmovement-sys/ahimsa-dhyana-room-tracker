const fs = require('fs');
let c = fs.readFileSync('src/app/api/export/participants/route.ts', 'utf8');

const searchTarget = `    let whereClause: any = {}
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

const replacement = `    const sessionCookie = request.headers.get('cookie') || ''
    const res = await fetch(\`http://localhost:4000/api/participants?q=\${encodeURIComponent(q)}&status=\${encodeURIComponent(status)}\`, {
      headers: { Cookie: sessionCookie }
    })
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Backend error' }, { status: res.status })
    }
    
    let participants = await res.json()`;

c = c.replace(searchTarget, replacement);
fs.writeFileSync('src/app/api/export/participants/route.ts', c);
