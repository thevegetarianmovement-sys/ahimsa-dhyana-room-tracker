/* eslint-disable */
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function ReportsShadsList() {
  const sessionCookie = cookies().get('session')?.value || ''
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads`, {
    headers: { Cookie: `session=${sessionCookie}` },
    cache: 'no-store'
  })
  const shads = res.ok ? await res.json() : []

  return (
    <div className="p-8 max-w-7xl mx-auto print:hidden">
      <Link href="/reports" className="text-blue-600 font-medium inline-block mb-4">&larr; Back to Reports</Link>
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Ground Accommodation / Shad ID Reports</h1>

      <div className="space-y-4">
        {shads.map((shad: any) => {
          const sTotalBeds = shad.capacity
          let sOccupied = 0

          shad.beds.forEach((b: any) => {
            if (b.allocations.length > 0) sOccupied++
          })

          return (
            <div key={shad.id} className="bg-white p-6 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">{shad.name}</h2>
                <p className="text-slate-500 text-sm">Code: {shad.code}</p>
                <div className="mt-2 text-sm text-slate-600 font-medium">
                  {sTotalBeds} Total Beds • {sOccupied} Allocated • {sTotalBeds - sOccupied} Available
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/reports/shads/${shad.id}`} className="bg-blue-100 text-blue-700 px-4 py-2 rounded font-bold hover:bg-blue-200">
                  View / Print List
                </Link>
              </div>
            </div>
          )
        })}
        {shads.length === 0 && <p className="text-slate-500">No shads found.</p>}
      </div>
    </div>
  )
}
