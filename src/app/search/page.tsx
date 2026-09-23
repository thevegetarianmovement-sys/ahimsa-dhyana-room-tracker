/* eslint-disable */
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SearchResultsPage({ searchParams }: { searchParams: { q?: string } }) {
  const sessionCookie = cookies().get('session')?.value || ''
  
  const query = searchParams.q || ''
  if (!query) {
    redirect('/dashboard')
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/participants?q=${encodeURIComponent(query)}`, {
    headers: { Cookie: `session=${sessionCookie}` },
    cache: 'no-store'
  })

  let participants = []
  if (res.ok) {
    participants = await res.json()
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link href="/dashboard" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Dashboard</Link>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Search Results for &quot;{query}&quot;</h1>

      {participants.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow border text-center text-slate-500">
          No participants found.
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 font-medium text-slate-600">Name</th>
                <th className="p-4 font-medium text-slate-600">Reg #</th>
                <th className="p-4 font-medium text-slate-600">Phone</th>
                <th className="p-4 font-medium text-slate-600">Location</th>
                <th className="p-4 font-medium text-slate-600">JADMS ID</th>
                <th className="p-4 font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {participants.map((p: any) => {
                const activeAlloc = p.allocations.find((a: any) => a.status === 'ACTIVE')
                let locationStr = 'Unassigned'
                if (activeAlloc) {
                  if (activeAlloc.bed) {
                    locationStr = `${activeAlloc.bed.room.hotel.name} - ${activeAlloc.bed.room.number} (${activeAlloc.bed.number})`
                  } else if (activeAlloc.shadBed) {
                    locationStr = `${activeAlloc.shadBed.shad.name} - ${activeAlloc.shadBed.number}`
                  }
                }

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{p.name}</td>
                    <td className="p-4 text-slate-600">{p.registrationNumber}</td>
                    <td className="p-4 text-slate-600">{p.phone || '-'}</td>
                    <td className="p-4 text-slate-600">{locationStr}</td>
                    <td className="p-4 text-slate-600">
                      {activeAlloc?.accommodationId ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                          {activeAlloc.accommodationId}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      <Link href={`/participants/${p.id}`} className="text-blue-600 hover:underline">
                        View Details
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
