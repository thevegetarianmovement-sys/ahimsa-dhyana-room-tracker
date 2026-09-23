/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VolunteerForm({ initialData = {} }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = !!initialData.id

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      isActive: formData.get('isActive') === 'on'
    }

    try {
      if (isEditing) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/volunteers/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error('Failed to update')
        router.refresh()
        alert('Saved successfully')
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/volunteers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error('Failed to create')
        router.push('/volunteers')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
        <input 
          type="text" 
          name="name" 
          defaultValue={initialData.name || ''} 
          required 
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
        <input 
          type="tel" 
          name="phone" 
          defaultValue={initialData.phone || ''} 
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          name="isActive" 
          id="isActive"
          defaultChecked={isEditing ? initialData.isActive : true}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active Volunteer</label>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving...' : (isEditing ? 'Update Volunteer' : 'Add Volunteer')}
      </button>
    </form>
  )
}
