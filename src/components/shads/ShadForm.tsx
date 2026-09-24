'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ShadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.get('name') as string,
          code: formData.get('code') as string,
          capacity: parseInt(formData.get('capacity') as string, 10),
        })
      })
      if (!res.ok) throw new Error('Error creating shad')
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Error creating shad')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md bg-white p-6 rounded-lg shadow border">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Shad Name</label>
        <input name="name" placeholder="e.g. Shad 1" required className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
        <input name="code" placeholder="e.g. S01" required className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Total Capacity (Beds)</label>
        <input type="number" name="capacity" defaultValue={300} min={1} required className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Address (Optional)</label>
        <textarea name="address" className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={3}></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps Link (Optional)</label>
        <input name="googleMapsLink" className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="https://goo.gl/maps/..." />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2 rounded shadow hover:bg-blue-700 transition-colors disabled:opacity-50">
        {loading ? 'Creating...' : 'Create Shad'}
      </button>
    </form>
  )
}
