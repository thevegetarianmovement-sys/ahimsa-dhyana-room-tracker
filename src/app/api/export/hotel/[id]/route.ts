/* eslint-disable */
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionCookie = request.headers.get('cookie') || ''
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels/${params.id}`, {
      headers: { Cookie: sessionCookie },
      cache: 'no-store'
    })
    
    if (!res.ok) return new NextResponse('Error loading hotel', { status: res.status })
    const hotel = await res.json()

    if (!hotel) return new NextResponse('Not found', { status: 404 })

    // Natural sort
    hotel.rooms.sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))
    hotel.rooms.forEach((r: any) => {
      r.beds.sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))
    })

    let csvContent = 'Room,Bed,Status,Participant Name,Phone,Registration Number,Check-In Date,Expected Check-Out\n'

    for (const r of hotel.rooms) {
      for (const b of r.beds) {
        const alloc = b.allocations[0]
        if (alloc) {
          const p = alloc.participant
          const ci = alloc.checkInDate.toISOString().split('T')[0]
          let co = alloc.checkOutDate.toISOString().split('T')[0]
          if (co === '2099-12-31') co = 'Not specified'
          
          csvContent += `"${r.number}","${b.number}","Occupied","${p.name}","${p.phone || ''}","${p.registrationNumber}","${ci}","${co}"\n`
        } else {
          csvContent += `"${r.number}","${b.number}","Available","","","","",""\n`
        }
      }
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${hotel.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_roster.csv"`
      }
    })
  } catch (error) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
}
