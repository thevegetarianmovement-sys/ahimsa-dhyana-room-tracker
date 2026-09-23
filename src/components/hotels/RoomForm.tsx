/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RoomForm({ hotelId }: { hotelId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels/${hotelId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          number: formData.get('number') as string,
          capacity: parseInt(formData.get('capacity') as string, 10)
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error adding room')
      }

      form.reset()
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error adding room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg border flex flex-col md:flex-row gap-4 items-end mb-8 shadow-sm">
      <div className="flex-1">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Room Number(s)</label>
        <input required name="number" placeholder="e.g. 101, 102 or 101-105" className="w-full border px-3 py-2 rounded text-sm" />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Capacity</label>
        <input required type="number" name="capacity" defaultValue={4} min={1} className="w-full border px-3 py-2 rounded text-sm" />
      </div>
      <div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white font-medium px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50 text-sm whitespace-nowrap">
          {loading ? 'Adding...' : '+ Add Room'}
        </button>
      </div>
    </form>
  )
}
