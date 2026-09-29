/* eslint-disable */
import Link from 'next/link'

export default async function DashboardPage() {
  const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  
  const [hotelsRes, shadsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' })
  ])

  const hotels = await hotelsRes.json()
  const shads = await shadsRes.json()

  // Calculate global metrics
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
        <h1 className="text-3xl font-bold text-slate-800">Accommodation Dashboard</h1>
      </div>

      {/* Metrics */}
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
          <p className="text-sm text-slate-500 font-medium">Available Hotel Beds</p>
          <p className="text-3xl font-bold text-green-600">{totalBeds - occupiedBeds}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-slate-500 font-medium">Occupied Hotel Beds</p>
          <p className="text-3xl font-bold text-red-600">{occupiedBeds}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 mt-8 text-slate-700">Hotels</h2>
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
                <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
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

      <h2 className="text-2xl font-bold mb-4 mt-12 text-slate-700">Ground Accommodation (Shads)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shads.map((shad: any) => {
          const sTotal = shad.capacity
          const sOccupied = shad.beds.filter((b: any) => b.allocations.length > 0).length

          return (
            <Link href={`/shads/${shad.id}`} key={shad.id} className="block">
              <div className="bg-white p-6 rounded-lg shadow border hover:border-blue-400 transition-colors">
                <h3 className="text-xl font-bold mb-2">{shad.name}</h3>
                <p className="text-sm text-slate-500 mb-4">Code: {shad.code}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Capacity: {sTotal}</span>
                  <span className="text-green-600 font-medium">Available: {sTotal - sOccupied}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
