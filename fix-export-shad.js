const fs = require('fs');
let c = fs.readFileSync('src/app/api/export/shad/[id]/route.ts', 'utf8');

c = c.replace(`    await requireAuth(['ADMIN'])
    
    const shad = await prisma.shad.findUnique({
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
    })`, `    const sessionCookie = request.headers.get('cookie') || ''
    const res = await fetch(\`http://localhost:4000/api/shads/\${params.id}\`, {
      headers: { Cookie: sessionCookie },
      cache: 'no-store'
    })
    
    if (!res.ok) return new NextResponse('Error loading shad', { status: res.status })
    const shad = await res.json()`);

fs.writeFileSync('src/app/api/export/shad/[id]/route.ts', c);
