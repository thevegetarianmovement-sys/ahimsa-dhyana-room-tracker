/* eslint-disable */
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ParticipantsPage({ searchParams }: { searchParams: { q?: string, status?: string, type?: string, location?: string } }) {
  const q = searchParams.q || ''
  const status = searchParams.status || ''
  const typeFilter = searchParams.type || 'ALL'
  const locationFilter = searchParams.location || ''
  const sessionCookie = cookies().get('session')?.value || ''

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/participants?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`, {
    headers: { Cookie: `session=${sessionCookie}` },
    cache: 'no-store'
  })
  
  if (!res.ok) {
    if (res.status === 401) redirect('/login')
    return <div className="p-8 text-center text-red-600">Backend Error</div>
  }

  let participants = await res.json()

  // Filter in memory for Hotel vs Shad
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

  const hRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' }); const hotels = hRes.ok ? await hRes.json() : [];
  const sRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' }); const shads = sRes.ok ? await sRes.json() : [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Participants</h1>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/export/participants?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&type=${encodeURIComponent(typeFilter)}&location=${encodeURIComponent(locationFilter)}`} className="bg-emerald-600 text-white px-4 py-2 rounded shadow-sm hover:bg-emerald-700 font-medium whitespace-nowrap">
            ↓ Export CSV
          </a>
          <Link href="/participants/import" className="bg-slate-200 text-slate-800 px-4 py-2 rounded shadow-sm hover:bg-slate-300 font-medium whitespace-nowrap">
            Bulk Import CSV
          </Link>
          <Link href="/participants/new" className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 font-medium whitespace-nowrap">
            + Add Participant
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6 flex flex-wrap items-end gap-4">
        <form method="GET" className="flex flex-wrap items-end gap-3 w-full">
          <input type="hidden" name="q" value={q} />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="type" value={typeFilter} />
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-bold text-slate-700 mb-1">Filter by Location</label>
            <select name="location" defaultValue={locationFilter} className="w-full border px-3 py-2 rounded bg-slate-50 focus:ring focus:outline-none">
              <option value="">All Locations</option>
              <optgroup label="Hotels">
                {hotels.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </optgroup>
              <optgroup label="Shads">
                {shads.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
            </select>
          </div>
          <button type="submit" className="bg-slate-800 text-white px-6 py-2 rounded font-medium hover:bg-slate-900 transition-colors">
            Apply Filter
          </button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-6 border-b pb-4 overflow-x-auto">
        <a 
          href={`/participants?q=${q}&status=${status}&type=ALL`}
          className={`px-4 py-2 rounded font-medium transition-colors whitespace-nowrap text-center ${typeFilter === 'ALL' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All Participants
        </a>
        <a 
          href={`/participants?q=${q}&status=${status}&type=HOTEL`}
          className={`px-4 py-2 rounded font-medium transition-colors whitespace-nowrap text-center ${typeFilter === 'HOTEL' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Hotel Accommodations
        </a>
        <a 
          href={`/participants?q=${q}&status=${status}&type=SHAD`}
          className={`px-4 py-2 rounded font-medium transition-colors whitespace-nowrap text-center ${typeFilter === 'SHAD' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Shad Accommodations
        </a>
      </div>

      <div className="mb-6">
        <form className="flex flex-col md:flex-row gap-2 max-w-2xl">
          <input type="hidden" name="type" value={typeFilter} />
          <input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search by name, phone, or accommodation ID..." 
            className="flex-1 border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select name="status" defaultValue={status} className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Checked-In (Active)</option>
            <option value="CHECKED_OUT">Checked-Out</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>
          <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700">
            Search
          </button>
        </form>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Name / Reg No</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Category</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Accommodation</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {participants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No participants found.
                </td>
              </tr>
            )}
            {participants.map((p: any) => {
              const activeAlloc = p.allocations[0]
              let accInfo = 'Not Assigned'
              if (activeAlloc) {
                if (activeAlloc.bed) {
                  accInfo = `${activeAlloc.accommodationId} (Hotel: ${activeAlloc.bed.room.hotel.name}, Room: ${activeAlloc.bed.room.number}, Bed: ${activeAlloc.bed.number})`
                } else if (activeAlloc.shadBed) {
                  accInfo = `${activeAlloc.accommodationId} (Shad: ${activeAlloc.shadBed.shad.name}, Bed: ${activeAlloc.shadBed.number})`
                }
              }

              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{p.name}</div>
                    <div className="text-sm text-slate-500">{p.registrationNumber || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    {activeAlloc ? (
                      activeAlloc.status === 'ACTIVE' 
                        ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Checked-In</span>
                        : activeAlloc.status === 'CHECKED_OUT'
                        ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Checked-Out</span>
                        : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{activeAlloc.status}</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {p.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {accInfo}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link href={`/participants/${p.id}`} className="text-blue-600 hover:text-blue-900">
                      View / Assign
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
