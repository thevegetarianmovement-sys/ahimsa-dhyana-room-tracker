/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

export default function VolunteerLoginForm({ 
  hotels, 
  shads
}: { 
  hotels: any[], 
  shads: any[]
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState<'HOTEL' | 'SHAD' | ''>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const formData = new FormData(e.currentTarget)
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/auth/volunteer-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          passcode: formData.get('passcode'),
          name: formData.get('name'),
          locationType: formData.get('locationType'),
          locationId: formData.get('locationId')
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Login failed')
      }

      window.location.href = '/volunteer'
    } catch (err: any) {
      setError(err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200 text-sm font-medium text-center">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Master Passcode</label>
        <input 
          type="password" 
          name="passcode" 
          required 
          placeholder="Enter event passcode"
          className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Your Full Name</label>
        <input 
          type="text" 
          name="name" 
          required 
          placeholder="e.g. John Doe"
          className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Assignment Category</label>
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
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Select {category === 'HOTEL' ? 'Hotel' : 'Shad'}
          </label>
          <select 
            name="locationId" 
            required
            className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
          >
            <option value="">-- Choose your specific location --</option>
            {category === 'HOTEL' 
              ? hotels.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))
              : shads.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
            }
          </select>
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 mt-4 shadow-md"
      >
        {loading ? 'Checking in...' : 'Start Shift'}
      </button>
    </form>
  )
}
