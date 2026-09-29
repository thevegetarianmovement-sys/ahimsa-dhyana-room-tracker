/* eslint-disable */
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionCookie = request.headers.get('cookie') || ''
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads/${params.id}`, {
      headers: { Cookie: sessionCookie },
      cache: 'no-store'
    })
    
    if (!res.ok) return new NextResponse('Error loading shad', { status: res.status })
    const shad = await res.json()

    if (!shad) return new NextResponse('Not found', { status: 404 })

    // Natural sort
    shad.beds.sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))

    let csvContent = 'Bed,Status,Participant Name,Phone,Registration Number,Check-In Date,Expected Check-Out\
'

    for (const b of shad.beds) {
      const alloc = b.allocations[0]
      if (alloc) {
        const p = alloc.participant
        csvContent += `"${b.number}","Occupied","${p.name}","${p.phone || ''}","${p.registrationNumber || ''}","${new Date(alloc.checkInDate).toISOString().split('T')[0]}","${new Date(alloc.checkOutDate).toISOString().split('T')[0]}"\
`
      } else {
        csvContent += `"${b.number}","Available","","","","",""\
`
      }
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="shad-${shad.code}-export.csv"`
      }
    })
  } catch (err) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}
