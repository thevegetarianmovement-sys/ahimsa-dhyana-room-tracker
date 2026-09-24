/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import RoomList from '@/components/hotels/RoomList'
import ShadBedList from '@/components/shads/ShadBedList'
import Link from 'next/link'

export default async function VolunteerDashboard() {
  const sessionCookie = cookies().get('session')?.value
  
  if (!sessionCookie) {
    redirect('/volunteer/login')
  }

  const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/auth/me`, {
    headers: { Cookie: `session=${sessionCookie}` },
    cache: 'no-store'
  })

  if (!sessionRes.ok) redirect('/volunteer/login')
  const sessionData = await sessionRes.json()
  const session = sessionData.user

  if (session.role !== 'VOLUNTEER') {
    redirect('/volunteer/login')
  }

  let locationName = ''
  let content = null

  if (session.locationType === 'HOTEL') {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels/${session.locationId}`, {
      headers: { Cookie: `session=${sessionCookie}` },
      cache: 'no-store'
    })
    
    if (!res.ok) notFound()
    const hotel = await res.json()
    
    // Natural sort is already done in Express or we do it here
    hotel.rooms.sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))
    hotel.rooms.forEach((r: any) => {
      r.beds.sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))
    })

    locationName = hotel.name
    content = <RoomList rooms={hotel.rooms} hotelId={hotel.id} hotel={hotel} />

  } else if (session.locationType === 'SHAD') {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads/${session.locationId}`, {
      headers: { Cookie: `session=${sessionCookie}` },
      cache: 'no-store'
    })

    if (!res.ok) notFound()
    const shad = await res.json()

    shad.beds.sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))
    
    locationName = shad.name
    content = <ShadBedList beds={shad.beds} shadId={shad.id} shad={shad} />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="font-bold text-lg leading-tight">{locationName}</h1>
          <p className="text-xs text-slate-300">Volunteer: {session.username}</p>
        </div>
        <Link 
          href="/volunteer/login" 
          className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded font-medium transition-colors"
        >
          Switch
        </Link>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {content}
      </main>
    </div>
  )
}
