/* eslint-disable */
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function VolunteerHotelDetails({ params }: { params: { id: string } }) {
  const { cookies } = await import('next/headers');
  const sessionCookie = cookies().get('session')?.value || '';
  const hRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels/${params.id}`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' }); const hotel = hRes.ok ? await hRes.json() : null;

  if (!hotel) notFound()

  // Find who is on duty RIGHT NOW
  const now = new Date()
  const hour = now.getHours()
  let currentShiftName = 'Shift 1'
  if (hour >= 13 && hour < 19) currentShiftName = 'Shift 2'
  else if (hour >= 19) currentShiftName = 'Shift 3'
  else if (hour < 7) currentShiftName = 'Shift 4'

  const today = new Date()
  today.setHours(0,0,0,0)

  const onDutyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/volunteers/on-duty?locationId=${hotel.id}&type=HOTEL`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' });
  let onDuty = onDutyRes.ok ? await onDutyRes.json() : [];
  onDuty = onDuty.filter((s: any) => s.shiftName === currentShiftName);

  let hTotalBeds = 0
  let hOccupied = 0
  let hCheckoutToday = 0

  hotel.rooms.forEach((r: any) => {
    hTotalBeds += r.beds.length
    r.beds.forEach((b: any) => {
      if (b.allocations.length > 0) {
        hOccupied++
        const todayStr = new Date().toISOString().split('T')[0]
        const checkoutStr = b.allocations[0].checkOutDate.toISOString().split('T')[0]
        if (todayStr === checkoutStr) hCheckoutToday++
      }
    })
  })

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-md mx-auto space-y-6 pb-12">
        <Link href="/volunteer/hotels" className="text-blue-600 font-medium inline-block mb-2">&larr; Back to Hotels</Link>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h1 className="text-3xl font-bold text-slate-800">{hotel.name}</h1>
          <p className="text-slate-500 mb-4">{hotel.location}</p>
          
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 p-2 rounded border">
              <p className="text-xs text-slate-500 font-bold uppercase">Available</p>
              <p className="text-xl font-bold text-green-600">{hTotalBeds - hOccupied}</p>
            </div>
            <div className="bg-slate-50 p-2 rounded border">
              <p className="text-xs text-slate-500 font-bold uppercase">Checkout Today</p>
              <p className="text-xl font-bold text-orange-500">{hCheckoutToday}</p>
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

        <h2 className="text-xl font-bold text-slate-800 ml-2">Rooms</h2>
        <div className="space-y-4">
          {hotel.rooms.map((room: any) => (
            <div key={room.id} className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="font-bold text-lg mb-3">Room {room.number}</h3>
              <div className="flex flex-wrap gap-2">
                {room.beds.map((bed: any) => {
                  let statusColor = 'bg-green-500'
                  if (bed.allocations.length > 0) {
                    const todayStr = new Date().toISOString().split('T')[0]
                    const checkoutStr = bed.allocations[0].checkOutDate.toISOString().split('T')[0]
                    if (todayStr === checkoutStr) statusColor = 'bg-orange-500'
                    else statusColor = 'bg-red-500'
                  }

                  return (
                    <div 
                      key={bed.id} 
                      className={`w-10 h-10 flex items-center justify-center text-white font-bold rounded ${statusColor}`}
                    >
                      {bed.number}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
