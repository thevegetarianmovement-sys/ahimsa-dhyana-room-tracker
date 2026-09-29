/* eslint-disable */
import Link from 'next/link'

export default async function ShadsPage() {
  const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads`, {
    headers: { Cookie: `session=${sessionCookie}` },
    cache: 'no-store'
  })
  if (!res.ok) return <div>Error loading shads</div>
  const shads = await res.json()

  let totalBeds = 0
  let occupiedBeds = 0

  shads.forEach((shad: any) => {
    totalBeds += shad.capacity
    occupiedBeds += shad.beds.filter((b: any) => b.allocations.length > 0).length
  })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Ground Accommodation (Shads)</h1>
        <Link href="/shads/new" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-medium">+ Add Shad</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-slate-500 font-medium">Total Shads</p>
          <p className="text-3xl font-bold">{shads.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-slate-500 font-medium">Shad Beds</p>
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
