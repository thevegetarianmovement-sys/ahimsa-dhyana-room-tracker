/* eslint-disable */
import Link from 'next/link'

export default async function VolunteerHotelsList({ searchParams }: { searchParams: { q?: string } }) {
  const { cookies } = await import('next/headers');
  const sessionCookie = cookies().get('session')?.value || '';
  const q = searchParams.q?.trim() || ''

  const hRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' }); const hotels = hRes.ok ? await hRes.json() : [];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/volunteer" className="text-blue-600 font-medium inline-block mb-2">&larr; Back to Search</Link>
        <h1 className="text-2xl font-bold text-slate-800">Hotels</h1>

        <form className="flex space-x-2">
          <input 
            name="q"
            defaultValue={q}
            placeholder="Search hotels..."
            className="flex-1 border-2 border-slate-300 px-4 py-2 rounded-xl focus:outline-none"
          />
          <button type="submit" className="bg-slate-800 text-white px-4 rounded-xl font-bold">Find</button>
        </form>

        <div className="space-y-4">
          {hotels.map((hotel: any) => {
            const capacityCounts: Record<number, number> = {}
            hotel.rooms?.forEach((r: any) => {
              const cap = r.beds?.length || 0
              capacityCounts[cap] = (capacityCounts[cap] || 0) + 1
            })

            return (
              <Link href={`/volunteer/hotels/${hotel.id}`} key={hotel.id} className="block bg-white p-4 rounded-xl shadow-sm border hover:border-blue-500">
                <h2 className="text-xl font-bold">{hotel.name}</h2>
                <p className="text-sm text-slate-500 mb-2">{hotel.location}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(capacityCounts)
                    .sort(([capA], [capB]) => Number(capA) - Number(capB))
                    .map(([cap, count]) => (
                      <span key={cap} className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                        {count} - {cap} beds
                      </span>
                    ))}
                </div>
              </Link>
            )
          })}
          {hotels.length === 0 && <p className="text-slate-500">No hotels found.</p>}
        </div>
      </div>
    </div>
  )
}
