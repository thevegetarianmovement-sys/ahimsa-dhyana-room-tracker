/* eslint-disable */
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PrintButton from '@/components/PrintButton'

export default async function ShadReportPage({ params }: { params: { id: string } }) {
  const sessionCookie = cookies().get('session')?.value || ''
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads/${params.id}`, {
    headers: { Cookie: `session=${sessionCookie}` },
    cache: 'no-store'
  })
  const shad = res.ok ? await res.json() : null

  if (!shad) notFound()

  // Generate today's date for report header
  const printDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  let hOccupied = 0
  let hTotal = 0

  shad.beds.forEach((b: any) => {
    hTotal++
    if (b.allocations?.length > 0) hOccupied++
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Non-printable controls */}
      <div className="p-4 bg-slate-100 border-b print:hidden flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/reports/shads" className="text-blue-600 font-medium hover:underline">
          &larr; Back to Shad Reports
        </Link>
        <PrintButton />
      </div>

      <div className="p-8 max-w-7xl mx-auto print:p-0">
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold uppercase">{shad.name}</h1>
          <p className="text-lg text-slate-600 mt-1">Accommodation ID Verification Report (Ground Layout)</p>
          <div className="flex justify-between mt-6 text-sm text-slate-500">
            <span>Printed: {printDate}</span>
            <span>Location: {shad.location} | Code: {shad.code}</span>
            <span>Occupancy: {hOccupied} / {hTotal} Beds</span>
          </div>
        </div>

        <div className="mb-8 avoid-break-inside">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-100">
                <th className="py-3 px-4 w-24">Bed</th>
                <th className="py-3 px-4 w-48">JADMS ID</th>
                <th className="py-3 px-4">Participant Name</th>
                <th className="py-3 px-4 w-32">Phone</th>
                <th className="py-3 px-4 w-48 text-right">Signature</th>
              </tr>
            </thead>
            <tbody>
              {shad.beds.map((bed: any) => {
                const alloc = bed.allocations[0]
                return (
                  <tr key={bed.id} className="border-b border-slate-200">
                    <td className="py-3 px-4 font-medium">{bed.number}</td>
                    {alloc ? (
                      <>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{alloc.accommodationId}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900 uppercase">{alloc.participant.name}</td>
                        <td className="py-3 px-4 text-slate-600">{alloc.participant.phone || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="border-b border-slate-400 w-full mt-4"></div>
                        </td>
                      </>
                    ) : (
                      <td colSpan={4} className="py-3 px-4 text-slate-400 italic">Unassigned</td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
