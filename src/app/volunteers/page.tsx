/* eslint-disable */

import Link from 'next/link'

export default async function VolunteersPage() {
  const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/volunteers`, { headers: { Cookie: 'session=' + sessionCookie }, cache: 'no-store' })
  if (!res.ok) throw new Error('Error')
  const volunteers = await res.json()

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Volunteers</h1>
        <div className="space-x-4">
          <Link href="/volunteers/new" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-medium">
            + Add Volunteer
          </Link>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Phone</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Status</th>
<th className="px-6 py-3 text-sm font-medium text-slate-500">Shifts</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {volunteers.map((v: any) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{v.name}</td>
                <td className="px-6 py-4 text-slate-600">{v.phone || '-'}</td>
                <td className="px-6 py-4">
                  {v.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm">
                  {v.shifts?.length || 0} shift(s)
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/volunteers/${v.id}`} className="text-blue-600 hover:underline text-sm font-medium">Edit</Link>
                </td>
              </tr>
            ))}
            {volunteers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No volunteers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
