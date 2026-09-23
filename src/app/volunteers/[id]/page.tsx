/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import VolunteerForm from '@/components/volunteers/VolunteerForm'
import AssignShiftForm from '@/components/volunteers/AssignShiftForm'
import DeleteShiftButton from '@/components/volunteers/DeleteShiftButton'
import { cookies } from 'next/headers'

export default async function VolunteerDetailsPage({ params }: { params: { id: string } }) {
  const sessionCookie = cookies().get('session')?.value || ''
  
  const [vRes, hRes, sRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/volunteers/${params.id}`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' })
  ])

  if (!vRes.ok) notFound()

  const volunteer = await vRes.json()
  const hotels = hRes.ok ? await hRes.json() : []
  const shads = sRes.ok ? await sRes.json() : []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/volunteers" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Volunteers</Link>
        <h1 className="text-3xl font-bold text-slate-800">Volunteer Details</h1>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm max-w-2xl">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Edit Profile</h2>
        <VolunteerForm initialData={volunteer} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Assign New Shift</h2>
          <AssignShiftForm volunteerId={volunteer.id} hotels={hotels} shads={shads} />
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Upcoming Shifts</h2>
          {(!volunteer.shifts || volunteer.shifts.length === 0) ? (
            <p className="text-slate-500 text-sm">No shifts assigned yet.</p>
          ) : (
            <div className="space-y-4">
              {volunteer.shifts.map((shift: any) => (
                <div key={shift.id} className="border p-4 rounded bg-slate-50 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{new Date(shift.date).toISOString().split('T')[0]} - {shift.shiftName}</p>
                    <p className="text-sm text-slate-600">{shift.startTime} to {shift.endTime}</p>
                    <p className="text-sm font-medium text-blue-600">{shift.hotel?.name || shift.shad?.name}</p>
                  </div>
                  <DeleteShiftButton shiftId={shift.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
