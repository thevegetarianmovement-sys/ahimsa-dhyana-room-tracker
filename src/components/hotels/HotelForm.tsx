'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HotelForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.get('name') as string,
          code: formData.get('code') as string,
          location: formData.get('location') as string,
          address: formData.get('address') as string,
          googleMapsLink: formData.get('googleMapsLink') as string
        })
      })
      if (!res.ok) throw new Error('Error creating hotel')
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Error creating hotel')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl bg-white p-6 rounded-lg shadow border">
      <div>
        <label className="block text-sm font-medium text-slate-700">Hotel Name</label>
        <input required name="name" className="mt-1 block w-full border px-3 py-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Code (e.g. H01)</label>
        <input required name="code" className="mt-1 block w-full border px-3 py-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Location</label>
        <input required name="location" className="mt-1 block w-full border px-3 py-2 rounded" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700">Full Address (Optional)</label>
        <textarea name="address" className="mt-1 block w-full border px-3 py-2 rounded" rows={3}></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Google Maps Link (Optional)</label>
        <input name="googleMapsLink" className="mt-1 block w-full border px-3 py-2 rounded" placeholder="https://goo.gl/maps/..." />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Creating...' : 'Create Hotel'}
      </button>
    </form>
  )
}
