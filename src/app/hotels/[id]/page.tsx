/* eslint-disable */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import RoomForm from '@/components/hotels/RoomForm'
import HotelEditForm from '@/components/hotels/HotelEditForm'
import RoomList from '@/components/hotels/RoomList'
import PrintButton from '@/components/PrintButton'

export default async function HotelDetailsPage({ params }: { params: { id: string } }) {
  const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels/${params.id}`, {
    headers: { Cookie: `session=${sessionCookie}` },
    cache: 'no-store'
  })
  
  if (!res.ok) {
    notFound()
  }
  const hotel = await res.json()

  if (!hotel) notFound()

  // Natural sort rooms and beds
  hotel.rooms.sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))
  hotel.rooms.forEach((r: any) => {
    r.beds.sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))
  })

  let hTotalBeds = 0
  let hOccupied = 0
  let hCheckoutToday = 0

  hotel.rooms.forEach((r: any) => {
    hTotalBeds += r.beds.length
    r.beds.forEach((b: any) => {
      if (b.allocations.length > 0) {
        hOccupied++
        const alloc = b.allocations[0]
        const today = new Date().toISOString().split('T')[0]
        const checkout = new Date(alloc.checkOutDate).toISOString().split('T')[0]
        if (today === checkout) hCheckoutToday++
      }
    })
  })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block print:hidden">&larr; Back to Dashboard</Link>
          <h1 className="text-4xl font-bold text-slate-800">{hotel.name}</h1>
          <p className="text-slate-500 text-lg">{hotel.location} • Code: {hotel.code}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <a href={`/api/export/hotel/${hotel.id}`} className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 font-medium text-sm transition-colors">
            ↓ Export CSV
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:hidden">
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-700">Edit Hotel Details</h2>
          <HotelEditForm hotel={hotel} />
        </div>
        
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded border">
              <p className="text-sm text-slate-500 font-medium">Total Rooms</p>
              <p className="text-2xl font-bold">{hotel.rooms.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded border">
              <p className="text-sm text-slate-500 font-medium">Available Beds</p>
              <p className="text-2xl font-bold text-green-600">{hTotalBeds - hOccupied}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded border">
              <p className="text-sm text-slate-500 font-medium">Checkout Today</p>
              <p className="text-2xl font-bold text-orange-500">{hCheckoutToday}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded border">
              <p className="text-sm text-slate-500 font-medium">Occupied Beds</p>
              <p className="text-2xl font-bold text-red-600">{hOccupied - hCheckoutToday}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-slate-700">Add Custom Room</h2>
        <RoomForm hotelId={hotel.id} />
      </div>

      <RoomList rooms={hotel.rooms} hotelId={hotel.id} />
    </div>
  )
}
