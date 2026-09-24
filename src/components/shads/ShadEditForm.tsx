'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ShadEditForm({ shad }: { shad: { id: string, name: string, code: string, capacity: number, address?: string, googleMapsLink?: string } }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads/${shad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.get('name') as string,
          code: formData.get('code') as string,
          capacity: parseInt(formData.get('capacity') as string, 10),
        })
      })
      if (!res.ok) throw new Error('Error updating shad')
      alert('Shad updated!')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Error updating shad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow border">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Shad Name</label>
        <input name="name" defaultValue={shad.name} required className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
        <input name="code" defaultValue={shad.code} required className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Total Capacity</label>
        <input type="number" name="capacity" defaultValue={shad.capacity} min={shad.capacity} required className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        <p className="text-xs text-slate-500 mt-1">Note: Capacity can only be increased.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Address (Optional)</label>
        <textarea name="address" defaultValue={shad.address || ''} className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={3}></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps Link (Optional)</label>
        <input name="googleMapsLink" defaultValue={shad.googleMapsLink || ''} className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="https://goo.gl/maps/..." />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white font-bold py-2 rounded shadow hover:bg-slate-900 transition-colors disabled:opacity-50">
        {loading ? 'Saving...' : 'Update Details'}
      </button>
    </form>
  )
}
