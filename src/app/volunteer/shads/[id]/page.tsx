/* eslint-disable */
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function VolunteerShadDetails({ params }: { params: { id: string } }) {
  const { cookies } = await import('next/headers');
  const sessionCookie = cookies().get('session')?.value || '';
  const sRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads/${params.id}`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' }); const shad = sRes.ok ? await sRes.json() : null;

  if (!shad) notFound()

  const now = new Date()
  const hour = now.getHours()
  let currentShiftName = 'Shift 1'
  if (hour >= 13 && hour < 19) currentShiftName = 'Shift 2'
  else if (hour >= 19) currentShiftName = 'Shift 3'
  else if (hour < 7) currentShiftName = 'Shift 4'

  const today = new Date()
  today.setHours(0,0,0,0)

  const onDutyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/volunteers/on-duty?locationId=${shad.id}&type=SHAD`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' });
  let onDuty = onDutyRes.ok ? await onDutyRes.json() : [];
  onDuty = onDuty.filter((s: any) => s.shiftName === currentShiftName);

  let sOccupied = 0
  let sCheckoutToday = 0

  shad.beds.forEach((b: any) => {
    if (b.allocations.length > 0) {
      sOccupied++
      const todayStr = new Date().toISOString().split('T')[0]
      const checkoutStr = b.allocations[0].checkOutDate.toISOString().split('T')[0]
      if (todayStr === checkoutStr) sCheckoutToday++
    }
  })

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-md mx-auto space-y-6 pb-12">
        <Link href="/volunteer/shads" className="text-blue-600 font-medium inline-block mb-2">&larr; Back to Shads</Link>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h1 className="text-3xl font-bold text-slate-800">{shad.name}</h1>
          <p className="text-slate-500 mb-4">{shad.capacity} Beds Total</p>
          
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 p-2 rounded border">
              <p className="text-xs text-slate-500 font-bold uppercase">Available</p>
              <p className="text-xl font-bold text-green-600">{shad.capacity - sOccupied}</p>
            </div>
            <div className="bg-slate-50 p-2 rounded border">
              <p className="text-xs text-slate-500 font-bold uppercase">Checkout Today</p>
              <p className="text-xl font-bold text-orange-500">{sCheckoutToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-sm font-bold text-slate-500 uppercase mb-4">ON DUTY NOW</h2>
          {onDuty.length > 0 ? (
            <div className="space-y-3">
              {onDuty.map((shift: any) => (
                <div key={shift.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">{shift.volunteer.name}</p>
                    {shift.volunteer.phone && (
                      <a href={`tel:${shift.volunteer.phone}`} className="text-blue-600 text-sm font-medium">
                        {shift.volunteer.phone}
                      </a>
                    )}
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">{shift.shiftName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No volunteers assigned for the current shift.</p>
          )}
        </div>
      </div>
    </div>
  )
}
