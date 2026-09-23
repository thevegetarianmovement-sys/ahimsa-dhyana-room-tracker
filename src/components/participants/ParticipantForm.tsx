/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ParticipantForm({ 
  initialData = {}, 
  categories = [] 
}: { 
  initialData?: any, 
  categories: any[] 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = !!initialData.id

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      registrationNumber: formData.get('registrationNumber') as string,
      phone: formData.get('phone') as string,
      gender: formData.get('gender') as string,
      categoryId: formData.get('categoryId') as string,
    }

    try {
      if (isEditing) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/participants/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        })
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/participants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        })
        const p = await res.json()
        router.push(`/participants/${p.id}`)
        return
      }
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Error saving participant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl bg-white p-6 rounded-lg shadow border">
      <div>
        <label className="block text-sm font-medium text-slate-700">Full Name *</label>
        <input 
          required 
          name="name" 
          defaultValue={initialData.name} 
          className="mt-1 block w-full border px-3 py-2 rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Registration Number</label>
        <input 
          name="registrationNumber" 
          defaultValue={initialData.registrationNumber} 
          className="mt-1 block w-full border px-3 py-2 rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Phone Number</label>
        <input 
          name="phone" 
          defaultValue={initialData.phone} 
          className="mt-1 block w-full border px-3 py-2 rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Gender</label>
          <select 
            name="gender" 
            defaultValue={initialData.gender || ''}
            className="mt-1 block w-full border px-3 py-2 rounded bg-white"
          >
            <option value="">Select...</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Category</label>
          <select 
            name="categoryId" 
            defaultValue={initialData.categoryId || ''}
            className="mt-1 block w-full border px-3 py-2 rounded bg-white"
          >
            <option value="">Uncategorized</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Participant'}
        </button>
      </div>
    </form>
  )
}
