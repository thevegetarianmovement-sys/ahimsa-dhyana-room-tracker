/* eslint-disable */
import Link from 'next/link'

export default async function HotelsPage() {
const readyHotels = [
  "MARJAN INTERNATIONAL", "GOPI RESIDENCY", "THREE CASTLE", "SRI SAI RESIDENCY",
  "HOTEL AADAAB", "NEW STAR LODGE", "BLUE STAR LODGE", "WEST INN",
  "SAI KIRAN LODGE", "HOTEL SAI PRAKASH", "HOTEL AAHWAANAM", "HOTEL TULASI"
];
const isReady = (name: string) => readyHotels.some(r => name.toUpperCase().includes(r.toUpperCase()));
  const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  
  const res = await fetch(`/api/hotels`, {
    headers: { Cookie: `session=${sessionCookie}` },
    cache: 'no-store'
  })
  
  if (!res.ok) {
    if (res.status === 401) return <div>Unauthorized</div>
    return <div>Error loading hotels</div>
  }
  
  const hotels = await res.json()
hotels.sort((a: any, b: any) => {
    const aReady = isReady(a.name) ? 1 : 0;
    const bReady = isReady(b.name) ? 1 : 0;
    if (bReady !== aReady) return bReady - aReady;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })

  let totalBeds = 0
  let occupiedBeds = 0

  hotels.forEach((hotel: any) => {
    hotel.rooms.forEach((room: any) => {
      totalBeds += room.beds.length
      occupiedBeds += room.beds.filter((b: any) => b.allocations.length > 0).length
    })
  })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Hotels</h1>
        <Link href="/hotels/new" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-medium">+ Add Hotel</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-slate-500 font-medium">Total Hotels</p>
          <p className="text-3xl font-bold">{hotels.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-slate-500 font-medium">Hotel Beds</p>
          <p className="text-3xl font-bold">{totalBeds}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-slate-500 font-medium">Available Beds</p>
          <p className="text-3xl font-bold text-green-600">{totalBeds - occupiedBeds}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-slate-500 font-medium">Occupied Beds</p>
          <p className="text-3xl font-bold text-red-600">{occupiedBeds}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hotels.map((hotel: any) => {
          let hTotalBeds = 0
          let hOccupied = 0
          hotel.rooms.forEach((r: any) => {
            hTotalBeds += r.beds.length
            hOccupied += r.beds.filter((b: any) => b.allocations.length > 0).length
          })

          return (
            <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="block">
              <div className="bg-white p-6 rounded-lg shadow border hover:border-blue-500 transition-colors">
                <h3 className="text-xl font-bold mb-2">
                    {hotel.name}
                    {isReady(hotel.name) && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full align-middle border border-green-200 shadow-sm">⭐ Ready</span>}
                  </h3>
                <p className="text-sm text-slate-500 mb-4">{hotel.location}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Capacity: {hTotalBeds}</span>
                  <span className="text-green-600 font-medium">Available: {hTotalBeds - hOccupied}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 mt-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full" 
                    style={{ width: `${hTotalBeds ? (hOccupied/hTotalBeds)*100 : 0}%` }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
