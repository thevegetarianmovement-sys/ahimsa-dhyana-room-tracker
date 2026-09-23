/* eslint-disable */
import VolunteerLoginForm from './VolunteerLoginForm'

export default async function VolunteerLoginPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/public/locations`, { cache: 'no-store' });
  const data = res.ok ? await res.json() : { hotels: [], shads: [] };
  const hotels = data.hotels;
  const shads = data.shads;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Volunteer Operations</h1>
          <p className="text-slate-400 text-sm mt-1">Event Self Check-in</p>
        </div>
        <div className="p-6">
          <VolunteerLoginForm hotels={hotels} shads={shads} />
        </div>
      </div>
    </div>
  )
}
