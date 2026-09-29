/* eslint-disable */
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function ReportsHotelsList() {
  const sessionCookie = cookies().get('session')?.value || ''
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels`, {
    headers: { Cookie: `session=${sessionCookie}` },
    cache: 'no-store'
  })
  const hotels = res.ok ? await res.json() : []

  return (
    <div className="p-8 max-w-7xl mx-auto print:hidden">
      <Link href="/reports" className="text-blue-600 font-medium inline-block mb-4">&larr; Back to Reports</Link>
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Hotel Accommodation ID Reports</h1>

      <div className="space-y-4">
        {hotels.map((hotel: any) => {
          let hTotalBeds = 0
          let hOccupied = 0

          hotel.rooms.forEach((r: any) => {
            hTotalBeds += r.beds.length
            r.beds.forEach((b: any) => {
              if (b.allocations.length > 0) hOccupied++
            })
          })

          return (
            <div key={hotel.id} className="bg-white p-6 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">{hotel.name}</h2>
                <p className="text-slate-500 text-sm">{hotel.location} • {hotel.code}</p>
                <div className="mt-2 text-sm text-slate-600 font-medium">
                  {hTotalBeds} Total Beds • {hOccupied} Allocated • {hTotalBeds - hOccupied} Available
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/reports/hotels/${hotel.id}`} className="bg-blue-100 text-blue-700 px-4 py-2 rounded font-bold hover:bg-blue-200">
                  View / Print List
                </Link>
              </div>
            </div>
          )
        })}
        {hotels.length === 0 && <p className="text-slate-500">No hotels found.</p>}
      </div>
    </div>
  )
}
