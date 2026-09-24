'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HotelEditForm({ hotel }: { hotel: { id: string, name: string, code: string, location: string | null } }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels/${hotel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.get('name') as string,
          code: formData.get('code') as string,
          location: formData.get('location') as string,
          address: formData.get('address') as string,
          googleMapsLink: formData.get('googleMapsLink') as string,
        })
      })
      if (!res.ok) throw new Error('Error updating hotel')
      alert('Hotel updated!')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Error updating hotel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow border">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Hotel Name</label>
        <input name="name" defaultValue={hotel.name} required className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
        <input name="code" defaultValue={hotel.code} required className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Location / Address</label>
        <input name="location" defaultValue={hotel.location || ''} className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white font-bold py-2 rounded shadow hover:bg-slate-900 transition-colors disabled:opacity-50">
        {loading ? 'Saving...' : 'Update Details'}
      </button>
    </form>
  )
}
