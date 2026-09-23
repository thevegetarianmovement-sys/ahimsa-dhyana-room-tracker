/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AssignShiftForm({ volunteerId, hotels, shads }: { volunteerId: string, hotels: any[], shads: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState<'HOTEL' | 'SHAD' | ''>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      locationType: formData.get('locationType'),
      locationId: formData.get('locationId'),
      date: formData.get('date'),
      shiftName: formData.get('shiftName'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/volunteers/${volunteerId}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to assign shift')
      }

      e.currentTarget.reset()
      setCategory('')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 bg-red-50 p-2 text-sm rounded">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Location Category</label>
        <div className="flex space-x-6">
          <label className="flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="locationType" 
              value="HOTEL" 
              checked={category === 'HOTEL'}
              onChange={() => setCategory('HOTEL')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
              required
            />
            <span className="text-slate-700 font-medium">Hotel</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="locationType" 
              value="SHAD" 
              checked={category === 'SHAD'}
              onChange={() => setCategory('SHAD')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
              required
            />
            <span className="text-slate-700 font-medium">Shad</span>
          </label>
        </div>
      </div>

      {category && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-sm font-medium mb-1 text-slate-700">Specific Location</label>
          <select name="locationId" required className="w-full border px-3 py-2 rounded">
            <option value="">-- Choose {category === 'HOTEL' ? 'Hotel' : 'Shad'} --</option>
            {category === 'HOTEL' 
              ? hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)
              : shads.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
            }
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input type="date" name="date" required className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Shift Name</label>
          <input type="text" name="shiftName" required placeholder="e.g. Morning Shift" className="w-full border px-3 py-2 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <input type="time" name="startTime" required className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Time</label>
          <input type="time" name="endTime" required className="w-full border px-3 py-2 rounded" />
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        Assign Shift
      </button>
    </form>
  )
}
