/* eslint-disable */
import Link from 'next/link'

export default async function VolunteerShadsList() {
  const { cookies } = await import('next/headers');
  const sessionCookie = cookies().get('session')?.value || '';
  const sRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' }); const shads = sRes.ok ? await sRes.json() : [];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/volunteer" className="text-blue-600 font-medium inline-block mb-2">&larr; Back to Search</Link>
        <h1 className="text-2xl font-bold text-slate-800">Ground Accommodation</h1>

        <div className="space-y-4">
          {shads.map((shad: any) => (
            <Link href={`/volunteer/shads/${shad.id}`} key={shad.id} className="block bg-white p-4 rounded-xl shadow-sm border hover:border-blue-500">
              <h2 className="text-xl font-bold">{shad.name}</h2>
              <p className="text-sm text-slate-500">Code: {shad.code}</p>
            </Link>
          ))}
          {shads.length === 0 && <p className="text-slate-500">No shads found.</p>}
        </div>
      </div>
    </div>
  )
}
