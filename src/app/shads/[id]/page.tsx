/* eslint-disable */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ShadEditForm from '@/components/shads/ShadEditForm'
import ShadBedList from '@/components/shads/ShadBedList'
import PrintButton from '@/components/PrintButton'

export default async function ShadDetailsPage({ params }: { params: { id: string } }) {
  const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads/${params.id}`, {
    headers: { Cookie: `session=${sessionCookie}` },
    cache: 'no-store'
  })
  if (!res.ok) notFound()
  const shad = await res.json()

  if (!shad) notFound()

  // Natural sort the beds so S01-2 comes before S01-10
  shad.beds.sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))

  const sTotal = shad.capacity
  const sOccupied = shad.beds.filter((b: any) => b.allocations.length > 0).length

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block print:hidden">&larr; Back to Dashboard</Link>
          <h1 className="text-4xl font-bold text-slate-800">{shad.name}</h1>
          <p className="text-slate-500 text-lg">Code: {shad.code}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <a href={`/api/export/shad/${shad.id}`} className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 font-medium text-sm transition-colors">
            ↓ Export CSV
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:hidden">
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-700">Edit Shad Details</h2>
          <ShadEditForm shad={shad} />
        </div>
        
        <div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded border">
              <p className="text-sm text-slate-500 font-medium">Capacity (Beds)</p>
              <p className="text-2xl font-bold">{sTotal}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded border">
              <p className="text-sm text-slate-500 font-medium">Occupied</p>
              <p className="text-2xl font-bold text-red-600">{sOccupied}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded border">
              <p className="text-sm text-slate-500 font-medium">Available</p>
              <p className="text-2xl font-bold text-green-600">{sTotal - sOccupied}</p>
            </div>
          </div>
        </div>
      </div>

      <ShadBedList beds={shad.beds} shadId={shad.id} shad={shad} />
    </div>
  )
}
