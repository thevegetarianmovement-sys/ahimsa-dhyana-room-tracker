const fs = require('fs');
let c = fs.readFileSync('src/app/api/export/hotel/[id]/route.ts', 'utf8');

c = c.replace(`    await requireAuth(['ADMIN'])
    
    const hotel = await prisma.hotel.findUnique({
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
          }
        }
      }
    })`, `    const sessionCookie = request.headers.get('cookie') || ''
    const res = await fetch(\`http://localhost:4000/api/hotels/\${params.id}\`, {
      headers: { Cookie: sessionCookie },
      cache: 'no-store'
    })
    
    if (!res.ok) return new NextResponse('Error loading hotel', { status: res.status })
    const hotel = await res.json()`);

fs.writeFileSync('src/app/api/export/hotel/[id]/route.ts', c);
