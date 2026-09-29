/* eslint-disable */
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const status = searchParams.get('status') || ''
    const typeFilter = searchParams.get('type') || 'ALL'
    const locationFilter = searchParams.get('location') || ''

    const sessionCookie = request.headers.get('cookie') || ''
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/participants?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`, {
      headers: { Cookie: sessionCookie }
    })
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Backend error' }, { status: res.status })
    }
    
    let participants = await res.json()

    // Memory Filters
    if (typeFilter === 'HOTEL') {
      participants = participants.filter((p: any) => p.allocations[0]?.bedId != null)
    } else if (typeFilter === 'SHAD') {
      participants = participants.filter((p: any) => p.allocations[0]?.shadBedId != null)
    }
    
    if (locationFilter) {
      participants = participants.filter((p: any) => 
        p.allocations[0]?.bed?.room?.hotelId === locationFilter || 
        p.allocations[0]?.shadBed?.shadId === locationFilter
      )
    }

    // Generate CSV
    const escapeCsv = (str: string | null | undefined) => {
      if (!str) return '""'
      const replaced = str.replace(/"/g, '""')
      return `"${replaced}"`
    }

    let csv = 'Registration Number,Name,Phone,Status,Location,Room,Bed,Check-In Date,Expected Check-Out\n'

    for (const p of participants) {
      const activeAlloc = p.allocations[0]
      let statusStr = 'UNASSIGNED'
      let locStr = ''
      let roomStr = ''
      let bedStr = ''
      let checkIn = ''
      let checkOut = ''

      if (activeAlloc) {
        statusStr = activeAlloc.status
        if (activeAlloc.bed) {
          locStr = activeAlloc.bed.room.hotel.name
          roomStr = activeAlloc.bed.room.number
          bedStr = activeAlloc.bed.number
        } else if (activeAlloc.shadBed) {
          locStr = activeAlloc.shadBed.shad.name
          roomStr = 'SHAD'
          bedStr = activeAlloc.shadBed.number
        }
        checkIn = activeAlloc.checkInDate ? activeAlloc.checkInDate.toISOString().split('T')[0] : ''
        checkOut = activeAlloc.checkOutDate ? activeAlloc.checkOutDate.toISOString().split('T')[0] : ''
      }

      csv += `${escapeCsv(p.registrationNumber)},${escapeCsv(p.name)},${escapeCsv(p.phone)},${escapeCsv(statusStr)},${escapeCsv(locStr)},${escapeCsv(roomStr)},${escapeCsv(bedStr)},${escapeCsv(checkIn)},${escapeCsv(checkOut)}\n`
    }

    const response = new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="Participants_Export_${Date.now()}.csv"`,
      },
    })
    return response

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}
